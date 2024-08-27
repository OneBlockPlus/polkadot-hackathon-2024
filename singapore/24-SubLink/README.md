# SubLink
## Introduction
SubLink is an open-source tool that converts Extrinsics on the Substrate blockchain into shareable links, allowing users to execute actions directly through these links.

## Background
Blockchain has introduced exciting decentralized technologies, leading to the emergence of dApps across various industries such as finance, social networking, and gaming. As builders in the web3, we hope to see an increasing number of users engaging with our products and services. With 5.4 billion web2 users worldwide, we rely on web2 social networks to promote our offerings. Unfortunately, there can be a gap between users and web3. Users must navigate to websites or download extensions to access web3 applications and services, which significantly reduces their willingness to engage.

## Features planned for the Hackathon
[x] Extract the extrinsics of the VARA pallet and convert them to Link<br>
[x] Read the dynamically generated interactive page of the link<br>
[x] A case of TVARA donation on X

## Architect
![img](https://github.com/xyajn/polkadot-hackathon-2024/blob/main/singapore/24-SubLink/src/img/image.png)

Extractor: Obtains metadata of the target chain, extracts Extrinsic from the metadata, converts Extrinsic into a URL, and outputs a URL file.

Processor: Reads the URL file and generates resource pages based on the URLs.

UI-Server: Provides page resource services to users.

Client: Handles user input and submits requests.


![img](https://github.com/xyajn/polkadot-hackathon-2024/blob/main/singapore/24-SubLink/src/img/image2.png)

## Team info
| Name        | Role                   |
| ----------- | ---------------------- |
| EldenRing   | Full Stack Developer   |
| Han         | Product Manager        |
| Peng        | UI Designer            |
| Alex        | Full Stack Developer   |

## Material for Demo
1. Demo Video [https://www.youtube.com/watch?v=JCWK-kqKdHg]
2. PPT [https://docs.google.com/presentation/d/1KCOYEmToWWtOwtT2t2VM5431Nl68-Ldo7kqEesNZNTQ/edit?usp=sharing]
