import subprocess

components = ["home", "navbar", "learn", "developer", "network", "register"]
services = ["services/auth", "services/chain"]

print(subprocess.call(["pwd"]))

for comp in components:
    subprocess.call(["ng", "g", "c", f"{comp}"])

for serv in services:
    subprocess.call(["ng", "g", "c", f"{serv}"])
