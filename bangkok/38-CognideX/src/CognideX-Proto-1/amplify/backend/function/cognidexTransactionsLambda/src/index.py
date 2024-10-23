import json
import boto3
import base64
import moonbeam_setup
import io
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
import zipfile
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
transactionsTable = dynamodb.Table('cognidexTransactionsDynamo-dev')
fileUploadTable = dynamodb.Table('cognidexFileUploadDynamo-dev')

s3 = boto3.client('s3')
bucket_name = 'verified-cognidex-datasets'

def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)  # Or use str(obj) if you want string representation
    else:
        return obj

def fulfill_transaction(transaction_hash, client_account_address, spent_amount):
    # Check if the transaction already exists in the database
    transaction_response = transactionsTable.query(
        KeyConditionExpression=Key('transactionHash').eq(transaction_hash)
    )
    
    transaction_info = transaction_response.get('Items', [])
    
    if transaction_info:
        transaction_data = transaction_info[0]
        return {
            'transactionHash': transaction_hash,
            'clientAccountAddress': client_account_address,
            'status': transaction_data['status'],
            'uploadHashes': transaction_data['uploadHashes'],
            'zipFile': transaction_data['zipFile'],
            'createdAt': transaction_data['createdAt'],
            'averageDataQuality': transaction_data['averageDataQuality'],
            'spentAmount': transaction_data['spentAmount'],
            'presignedUrl': transaction_data['presignedUrl']
        }
    
    setup_data = moonbeam_setup.setup()
    
    if setup_data:
        web3 = setup_data["web3"]
        contract = setup_data["contract"]
        
        print("Setup successful.")
        
        # Current block number
        block_number = web3.eth.block_number
        
        block_2_hours_ago = block_number - 1200
        
        logs = contract.events.DataUploadsPurchased().get_logs(from_block=block_2_hours_ago, to_block=block_number)
        
        transaction_hash_bytes = web3.to_bytes(hexstr=transaction_hash)
        
        upload_hashes = []
        datapool_id = ''
        average_data_quality = 0
        
        object_keys = []
        
        for log in logs:
            if log['transactionHash'] == transaction_hash_bytes:
                log_info = log['args']
                datapool_id = log_info['dataPoolId']
                average_data_quality = Decimal(str(log_info['dataQuality']/10**17))
                for uploadHash in log_info['uploadHashes']:
                    encoded_upload_hash = base64.b64encode(uploadHash).decode('utf-8')
                    upload_hashes.append(encoded_upload_hash)
                    
        print(f"Upload Hashes: {upload_hashes}")
        print(f"Data Pool ID: {datapool_id}")
        print(f"Average Data Quality: {average_data_quality}")
        
        for upload_hash in upload_hashes:
            response = fileUploadTable.query(
                IndexName='uploadHashIndex',
                KeyConditionExpression=Key('uploadHash').eq(upload_hash)
            )
            
            userInfo = response['Items'][0]
            
            user_id = userInfo['userId']
            
            object_keys.append(f'{user_id}/{datapool_id}/{datapool_id}_verified.zip')
        
        print(f"Object Keys: {object_keys}")
        
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for key in object_keys:
                try:
                    # Get the object from S3
                    response = s3.get_object(Bucket=bucket_name, Key=key)
                    file_content = response['Body'].read()
                    # Add the file to the ZIP archive
                    file_name = key.split('/')[0]  # Use the user ID as the file name
                    zip_file.writestr(file_name, file_content)
                except ClientError as e:
                    print(f"Error retrieving {key} from S3: {e}")
                    continue  # Skip this file if there's an error
        
        # After writing all files to the ZIP, reset the buffer position
        zip_buffer.seek(0)
        
        # Define a simple name for the ZIP file, e.g., using the transaction hash
        zip_file_name = f"dataset-{transaction_hash[:10]}.zip"
        
        zip_file_path = f"tmp/{zip_file_name}"
        
        # Upload the ZIP file back to S3
        try:
            s3.put_object(
                Bucket=bucket_name,
                Key=zip_file_path,
                Body=zip_buffer.getvalue(),
                ContentType='application/zip'
            )
        except ClientError as e:
            print(f"Error uploading ZIP file to S3: {e}")
            return None
        
        # Generate a presigned URL for the ZIP file
        try:
            presigned_url = s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': zip_file_path
                },
                ExpiresIn=7200  # URL expiration time in seconds (e.g., 2 hours)
            )
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return None
        
        # Update the transaction status in the database
        try:
            transactionsTable.put_item(
                Item={
                    'transactionHash': transaction_hash,
                    'clientAccountAddress': client_account_address,
                    'status': 'fulfilled',
                    'zipFile': zip_file_path,
                    'createdAt': str(datetime.now()),
                    'spentAmount': spent_amount,
                    'averageDataQuality': average_data_quality,
                    'uploadHashes': upload_hashes,
                    'presignedUrl': presigned_url
                }
            )
        except ClientError as e:
            print(f"Error updating transaction status in the database: {e}")
            return
        
        # Return the presigned URL along with the transaction details
        return {
            'transactionHash': transaction_hash,
            'clientAccountAddress': client_account_address,
            'status': 'fulfilled',
            'uploadHashes': upload_hashes,
            'zipFile': zip_file_path,
            'createdAt': str(datetime.now()),
            'spentAmount': spent_amount,
            'averageDataQuality': average_data_quality,
            'presignedUrl': presigned_url
        }
    else:
        print("Setup failed.")
        return None

def get_transaction(client_account_address):
    response = transactionsTable.query(
        IndexName='clientAccountAddressIndex',
        KeyConditionExpression=Key('clientAccountAddress').eq(client_account_address)
    )
    
    transactions = response.get('Items', [])
    
    # Optional: Sort transactions by creation time, descending
    transactions = sorted(transactions, key=lambda x: x['createdAt'], reverse=True)
    
    return transactions

def handler(event, context):
    print('Received event:')
    print(event)
    
    if event['httpMethod'] == 'POST':
        # Parse the event to get the transaction hash, client account address, and spent amount
        body = json.loads(event.get('body', '{}'))
        transaction_hash = body.get('transactionHash')
        client_account_address = body.get('clientAccountAddress')
        spent_amount = body.get('spentAmount')

        if not transaction_hash or not client_account_address or not spent_amount:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps('Missing transactionHash, clientAccountAddress, or spentAmount in the request.')
            }
        
        # Call the fulfill_transaction function
        response_data = fulfill_transaction(transaction_hash, client_account_address, spent_amount)
        
        converted_transactions= convert_decimals(response_data)
        
        if response_data:
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(converted_transactions)
            }
        else:
            return {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps('Error processing the transaction.')
            }
    
    elif event['httpMethod'] == 'GET':
        # Parse the event to get the client account address
        client_account_address = event.get('queryStringParameters', {}).get('clientAccountAddress')
        
        if not client_account_address:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps('Missing clientAccountAddress in the request.')
            }
        
        # Call the get_transaction function
        transactions = get_transaction(client_account_address)
        
        converted_transactions = convert_decimals(transactions)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(converted_transactions)
        }
        
    else:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps('Invalid HTTP method.')
        }
