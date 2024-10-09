import network
import time
import urequests
import ujson
from machine import SoftI2C, Pin
from i2c_lcd import I2cLcd

def connect_wifi(ssid, password, timeout=10):
    print("Connecting to WiFi", end="")
    sta_if = network.WLAN(network.STA_IF)
    # Reset previous connection to resolve some esp32 internal WiFi issues.
    # sta_if.disconnect()
    sta_if.active(False)
    time.sleep(1)
    sta_if.active(True)
    sta_if.connect(ssid, password)
    
    start_time = time.time()
    
    while not sta_if.isconnected():
        print(".", end="")
        time.sleep(0.1)
        if time.time() - start_time > timeout:
            print(" Failed to connect!")
            return False

    print(" Connected!")
    print('Network config:', sta_if.ifconfig())
    return True

def send_tx(api_endpoint, sender_relay_id, sender_mnemonic_part, recipient_relay_id, amount):
    print("Sending tx...")
    request_body = {
        "relayId": sender_relay_id,
        "mnemonicPart": sender_mnemonic_part,
        "recipient": recipient_relay_id,
        "amount": amount
    }
    
    headers = {'Content-Type': 'application/json'}
    json_body = ujson.dumps(request_body)
    response = urequests.post(api_endpoint, data=json_body, headers=headers)
    
    print("Response Status:", response.status_code)
    print("Response Content:", response.text)
    
    response.close()
    
    print("Transaction sent.")

def write_to_lcd(scl, sda, frequency, msg):
    DEFAULT_I2C_ADDR = 0x27
    
    i2c = SoftI2C(scl=Pin(scl), sda=Pin(sda), freq=frequency)
    lcd = I2cLcd(i2c, DEFAULT_I2C_ADDR, 2, 16)
    
    lcd.clear()
    lcd.move_to(3, 0)
    lcd.putstr(msg)
    
rows = [Pin(2, Pin.OUT), Pin(4, Pin.OUT), Pin(5, Pin.OUT), Pin(18, Pin.OUT)]
cols = [Pin(19, Pin.IN, Pin.PULL_DOWN), Pin(13, Pin.IN, Pin.PULL_DOWN), Pin(12, Pin.IN, Pin.PULL_DOWN), Pin(14, Pin.IN, Pin.PULL_DOWN)]

keys = [['1', '2', '3', 'A'],
        ['4', '5', '6', 'B'],
        ['7', '8', '9', 'C'],
        ['*', '0', '#', 'D']]
    
def read_keypad():
    for row_idx, row in enumerate(rows):
        # Set the current row to high
        row.value(1)
        
        # Check all column values for a high signal
        for col_idx, col in enumerate(cols):
            if col.value() == 1:
                row.value(0)
                return keys[row_idx][col_idx]
        
        # Set the row back to low
        row.value(0)
    return None
    

