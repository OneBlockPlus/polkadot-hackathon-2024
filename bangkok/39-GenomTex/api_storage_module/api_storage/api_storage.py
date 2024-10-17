from dotenv import load_dotenv
import requests
import os

load_dotenv()

api_key = os.getenv('API_KEY')
api_key_secret = os.getenv('API_KEY_SECRET')
authentication = os.getenv('AUTHENTICATION')
bucket_id = os.getenv('BUCKET_ID')


def create_upload_session(file_name, content_type='text/plain'):
    """
    Create an upload session using the Apillon API for a specific bucket.

    Args:
    - file_name (str): Name of the file to upload.
    - content_type (str): The MIME type of the file.

    Returns:
    - Response JSON or error message.
    """
    url = f"https://api.apillon.io/storage/buckets/{bucket_id}/upload"

    headers = {
        "Authorization": authentication,
        "Content-Type": "application/json"
    }

    payload = {
        "files": [
            {
                "fileName": file_name,
                "contentType": content_type
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200 or  response.status_code == 201:
            return response.json()
        else:
            return f"Error: {response.status_code}, {response.text}"
    except requests.exceptions.RequestException as e:
        return f"Request failed: {e}"


def put_file(upload_url, filename):
    """
    Uploads a file to the provided upload URL using the PUT request.

    Args:
    - upload_url (str): The URL to which the file will be uploaded.
    - filename (str): The name of the file to be uploaded.

    Returns:
    - Success message or error message based on the result of the upload.
    """
    try:
        with open(filename, 'rb') as file_pointer:
            headers = {
                "Content-Type": "text/plain"
            }

            response = requests.put(upload_url, headers=headers, data=file_pointer)

            if response.status_code == 200:
                return "File uploaded successfully!"
            else:
                return f"Error: {response.status_code}, {response.text}"
    except FileNotFoundError:
        return f"Error: File '{filename}' not found."
    except requests.exceptions.RequestException as e:
        return f"Request failed: {e}"


def end_session(bucket_id, session_id):
    """
    Ends the upload session using the Apillon API.

    Args:
    - bucket_id (str): The ID of the bucket.
    - session_id (str): The ID of the session to be ended.

    Returns:
    - Success message or error message based on the result of the request.
    """
    url = f"https://api.apillon.io/storage/buckets/{bucket_id}/upload/{session_id}/end"

    headers = {
        "Authorization": authentication,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, headers=headers)

        if response.status_code == 200:
            return "Session ended successfully!"
        else:
            return f"Error: {response.status_code}, {response.text}"
    except requests.exceptions.RequestException as e:
        return f"Request failed: {e}"


def get_file_details(cid):
    url = f"https://api.apillon.io/storage/buckets/{bucket_id}/files/{cid}"
    headers = {
        "Authorization": f"{authentication}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except Exception as err:
        print(f"Other error occurred: {err}")


def is_file_uploaded(cid) -> bool:
    return get_file_details(cid)["status"] == 200
   


if __name__=='__main__':
    # Example usage
    file_name = "test_file2.txt"
    result = create_upload_session(file_name)

    print(">>> CREATE session result:")
    print(result)

    session_uuid = result['data']['sessionUuid']
    upload_url = result['data']['files'][0]['url']

    result = put_file(upload_url, 'test_file2.txt')

    print(">>> PUT result:")
    print(result)

    result = end_session(bucket_id, session_uuid)


    print(">>> END session result:")
    print(result)

    # check file presence
    my_cid = "bafybeihwcndvlxjknls7ojoycwoqkz52js32n4ns5kt76wslz7hwxoma4a"
    result = is_file_uploaded(my_cid)
    print(f'file present: {result}')