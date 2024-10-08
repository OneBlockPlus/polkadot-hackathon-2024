from relay_sdk import *
from time import sleep


# connect_wifi("MagicSheep", "12345678")

# Prepare the transaction body
api_endpoint = "https://relay-api-test-c1wq.vercel.app/api/construct-tx"
# Sender's relay is is the wallet address they used when registering with us,
# not the generated wallet address
sender_relay_id = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
sender_mnemonic_part = "survey_aim_twenty_couch_beach_trend_mind_anxiety_eagle"
# Recipient / Shop owner's id is the generated wallet address
recipient_relay_id = "5DAmT9DGUX6LDnKKL9K578cf7bxJncHsX3sUYJFz9k55HAmD"
# 1 ROC
amount = 1000000000000

# send_tx(api_endpoint, sender_relay_id, sender_mnemonic_part, recipient_relay_id, amount)

scl = 22
sda = 21
frequency = 400000
msg = "1 ROC Sent"

# Main loop to read keypad inputs
print("Press a key on the keypad:")
while True:
    key = read_keypad()
    if key:
        write_to_lcd(scl, sda, frequency, key)
        sleep(0.3)  # Debounce delay

