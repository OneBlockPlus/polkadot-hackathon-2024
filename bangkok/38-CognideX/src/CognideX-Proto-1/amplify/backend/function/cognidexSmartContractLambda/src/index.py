import json
import moonbeam_setup
from merkle_tree import MerkleTree
import boto3
from boto3.dynamodb.conditions import Key
import base64

dynamodb = boto3.resource('dynamodb')
fileUploadTable = dynamodb.Table('cognidexFileUploadDynamo-dev')
merkleTreeTable = dynamodb.Table('cognidexMerkleTreeDynamo-dev')

def upload_incentive(user_id, data_pool_id, client_account_address):
    setup_data = moonbeam_setup.setup()
    
    if setup_data:
        web3 = setup_data["web3"]
        contract = setup_data["contract"]
        private_key = setup_data["private_key"]
        account_address = setup_data["account_address"]

        print("Setup successful.")
        
        # Query the database for the uplaod data
        response = fileUploadTable.query(
            IndexName='userIdDataPoolIndex',
            KeyConditionExpression=Key('userId').eq(user_id) & Key('dataPoolId').eq(data_pool_id)
        )
        
        uploadInfo = response['Items'][0]
        
        if uploadInfo == None:
            print("No data found for the user")
            return {
                'statusCode': 404,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps('No data found for the user')
            }
        elif uploadInfo['rewardClaimed'] == True:
            print("Incentive already claimed")
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps('Incentive already claimed')
            }
        else:
            merkle_tree_response = merkleTreeTable.query(
                KeyConditionExpression=Key('treeName').eq('dataUploadTree') & Key('treeInfo').eq('TreeInfo')
            )
            
            # Retrieve items
            items = merkle_tree_response.get('Items', [])[0]
            
            print(f"Items: {items}")
            
            treeLeaves = items['treeLeaves']
            
            encodedUploadHash = uploadInfo['uploadHash']
            
            decodedUploadHash = base64.b64decode(encodedUploadHash.encode('utf-8'))
            
            merkle_tree = MerkleTree(treeLeaves)
            
            data_quality_score = int(uploadInfo['dataQualityScore'])
            
            leaf_index = int(uploadInfo['uploadIndex'])
            
            # Get the file hash and the incentive amount
            merkle_proof_bytes = merkle_tree.get_proof_as_bytes(leaf_index)
            
            merkle_tree.update_leaf(leaf_index, f'{user_id}_{data_quality_score}_{data_pool_id}_claimed')
            
            new_merkle_root = merkle_tree.get_root()
            
            new_merkle_leaves = merkle_tree.data_list
            
            transaction = contract.functions.uploadIncentive(
                decodedUploadHash,
                merkle_proof_bytes,
                data_quality_score,
                leaf_index,
                data_pool_id,
                new_merkle_root,
                client_account_address
            ).build_transaction({
                'from': account_address,
                'nonce': web3.eth.get_transaction_count(account_address),
                'gas': 400000, 
                'gasPrice': web3.to_wei('10', 'gwei')
            })
            
            signed_txn = web3.eth.account.sign_transaction(transaction, private_key=private_key)
            
            try:
                tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
                print(f"Transaction sent! Hash: {tx_hash.hex()}")

                receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
                print(f"Transaction confirmed in block {receipt.blockNumber}")
                
                if receipt.status == 1:
                    encoded_root = base64.b64encode(new_merkle_root).decode('utf-8')
                    
                    # Update the status of the upload in the database
                    fileUploadTable.update_item(
                        Key={
                            'userId': user_id,
                            'uploadHash': encodedUploadHash
                        },
                        UpdateExpression="SET #s = :s",
                        ExpressionAttributeValues={
                            ':s': True
                        },
                        ExpressionAttributeNames={
                            '#s': 'rewardClaimed'
                        }
                    )
                    
                    merkleTreeTable.update_item(
                        Key={
                            'treeName': 'dataUploadTree',
                            'treeInfo': 'TreeInfo'
                        },
                        UpdateExpression="SET #r = :r, #l = :l",
                        ExpressionAttributeValues={
                            ':r': encoded_root,
                            ':l': new_merkle_leaves
                        },
                        ExpressionAttributeNames={
                            '#r': 'treeRoot',
                            '#l': 'treeLeaves'
                        }
                    )
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Access-Control-Allow-Headers': '*',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                        },
                        'body': json.dumps(
                            {
                                'transactionHash': tx_hash.hex(),
                                'blockNumber': receipt.blockNumber,
                                'status': 'success'
                            }
                        )
                    }

            except Exception as e:
                print(f"Error sending transaction: {e}")
                

def handler(event, context):
    print('received event:')
    print(event)
    
    if event['httpMethod'] == 'POST':
        # Path 
        if event['path'] == '/smart-contract/upload-incentive':
            # Extract the company name from the request body
            body = json.loads(event['body'])
            user_id = body['userId']
            data_pool_id = body['dataPoolId']
            client_account_address = body['clientAccountAddress']
            
            return upload_incentive(user_id, data_pool_id, client_account_address)
    else:
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps('Hello from your new Amplify Python lambda!')
        }