import os, subprocess

folders = ["Auth", "DataOracle", "TRN"]

print(os.getcwd())

for package in folders:
    os.chdir(f"{package}")
    print("Currently in: ", os.getcwd())
    if 'package.json' in os.listdir():
        print("package.json found...")
        print("running npm i to install...")
        subprocess.call(["npm", "i"])
    os.chdir("..")