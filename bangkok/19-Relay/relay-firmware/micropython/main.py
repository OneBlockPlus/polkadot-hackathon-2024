import urequests
import time
import json
import ubinascii
from mfrc522 import MFRC522
import wifi

# Constants
API_ENDPOINT = "https://endpoint"
MERCHANT_ADDRESS = "0xMerchantAddressHere"  # This should be burned into the ESP32 firmware


def send_api_request(partial_mnemonic, amount, merchant_address):
    headers = {'Content-Type': 'application/json'}
    payload = {
        "partial_mnemonic": partial_mnemonic,
        "amount": amount,
        "merchant_address": merchant_address
    }
    try:
        response = urequests.post(API_ENDPOINT, json=payload, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print("Failed to send transaction, Status Code:",
                  response.status_code)
            return None
    except Exception as e:
        print("Request failed:", e)
        return None
    finally:
        if 'response' in locals():
            response.close()


def scan_rfid():
    rdr = MFRC522(spi_id=0, sck=2, miso=4, mosi=3, cs=5, rst=0)
    print("Scanning RFID...")
    while True:
        (stat, tag_type) = rdr.request(rdr.REQIDL)
        if stat == rdr.OK:
            (stat, raw_uid) = rdr.anticoll()
            if stat == rdr.OK:
                uid = "".join(["%02X" % x for x in raw_uid])
                print(f"RFID scanned: {uid}")
                return uid
        time.sleep(0.1)


def get_amount_input():
    while True:
        try:
            amount = float(input("Enter the payment amount: "))
            return int(amount *
                       1e18)  # Convert to smallest unit (e.g., Planck for DOT)
        except ValueError:
            print("Invalid input. Please enter a valid number.")


def main():
    ssid = "WiFiSSID"
    password = "Password"
    wifi.connect_wifi(ssid, password)

    while True:
        print("Waiting for RFID scan...")
        partial_mnemonic = scan_rfid()
        if partial_mnemonic:
            amount = get_amount_input()

            print("Sending transaction request...")
            result = send_api_request(partial_mnemonic, amount,
                                      MERCHANT_ADDRESS)

            if result:
                print("Transaction result:", result)
            else:
                print("Transaction failed. Please try again.")

        time.sleep(1)  # Wait a bit before next scan


if __name__ == "__main__":
    main()
