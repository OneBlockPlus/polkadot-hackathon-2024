# GenomTex

The project aims to store an individual's DNA information indefinitely, tracking any changes in
the DNA to detect potential cancerous gene variants. It also generates a DNA fingerprint to ensure
the individual's identity remains unambiguous.

## Installation

`pip install -r requirements.txt`

run flask web server for front-end access of our data

`python run app.py`

install node dependencies

`npm i`

run IPFS node for data <-> cache exchange

`npm run start`
    
## What we have well before hackathon

  - cooperation with genome sequencing laboratory
  - know-how to create minimal differential DNA files
  - code to work with the blockchain storage

## Deliverables for the hackathon

  - functional front-end and back-end
  - code to correctly calculate changes for the entire DNA reconstruction
  - mathematical function for DNA fingerprinting

## Storage

The differences in DNA among humans are minimal. To efficiently store these variations for each individual,
a format called Variant Call Format (.vcf) was created, allowing for more compact records. To monitor changes
in individual DNA records over time, we only track modifications relative to this .vcf file. The reference
genome used in our program is known as hg38.

DNA in .vcf format, along with its subsequent differences, is stored locally for quick access and on the Crust Network.
The local storage serves as a cache. If the cache becomes outdated or storage fails for any reason, it can be
re-downloaded from the Crust Network. This system ensures that an individual's genome remains securely stored,
protecting it from any malicious attempts to alter its content.
