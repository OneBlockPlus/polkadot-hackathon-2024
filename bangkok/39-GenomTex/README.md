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

## Development

### Get Biotechnology tools

Samtools and BCFtools are standard tools used in the field of genomics.
Get them for data preparation at <https://www.htslib.org>.

### Get reference genome

Most of our sequencing data are generated against hg38 reference genome. We need to download this one.

    wget ftp://ftp.ensembl.org/pub/release-104/fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.primary_assembly.fa.gz

Index it to make any subsequent operations faster.

    samtools faidx Homo_sapiens.GRCh38.dna.primary_assembly.fa

### Generate .bcf / .vcf file for diffs

Generate .bcf file with all variants kept.

    bcftools mpileup -Ou -f hg38.fa 8f0fd05f-3b35-422c-b5d4-bc9f2888225f.bam | \
    bcftools call -mv -Ob -o variants.bcf

Convert back to .vcf

    bcftools view variants.bcf -Oz -o variants.vcf.gz

Filter out low-quality data for even better compression

    bcftools filter -s LOWQUAL -e '%QUAL<20 || DP<10' variants.vcf -o filtered_variants.vcf
