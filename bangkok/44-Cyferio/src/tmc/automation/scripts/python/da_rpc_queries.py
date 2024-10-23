import urllib.request
import urllib.parse
import json
import sys

HEIGHT_QUERY = "{}/block?height={}"
STATUS_QUERY = "{}/status?"

def get_block_hash(rpc_url, height):
    url = HEIGHT_QUERY.format(rpc_url, height)
    try:
        with urllib.request.urlopen(url) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                block_hash = data.get("result", {}).get("block_id", {}).get("hash", "Hash not found")
                print(block_hash)
            else:
                print(f"Failed to retrieve data, status code: {response.status}")
    except urllib.error.URLError as e:
        print(f"Error fetching data: {e}")

def get_latest_height(rpc_url):
    url = STATUS_QUERY.format(rpc_url)
    try:
        with urllib.request.urlopen(url) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                latest_height = data.get("result", {}).get("sync_info", {}).get("latest_block_height", "Height not found")
                print(latest_height)
            else:
                print(f"Failed to retrieve data, status code: {response.status}")
    except urllib.error.URLError as e:
        print(f"Error fetching data: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage:")
        print("script.py get_hash <rpc_url> <height>")
        print("script.py get_latest_height <rpc_url>")
        sys.exit(1)

    mode = sys.argv[1]

    if mode == "get_hash" and len(sys.argv) == 4:
        _, _, rpc_url, height = sys.argv
        get_block_hash(rpc_url, height)
    elif mode == "get_latest_height" and len(sys.argv) == 3:
        _, _, rpc_url = sys.argv
        get_latest_height(rpc_url)
    else:
        print("Invalid usage.")
        print("For block hash: script.py get_hash <rpc_url> <height>")
        print("For latest height: script.py get_latest_height <rpc_url>")
        sys.exit(1)
