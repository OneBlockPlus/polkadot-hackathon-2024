# iNFT

## Overview

- It is a new way to mint NFT by block hash and unmodified template file on chain.

- The design of template can make iNFT identifiable.

- As every blockchain network have random block hash, iNFT can be deployed to multi chain. It is pretty interesting that Dapp can balance value between different networks by mathematics scarcity.

- Networks supported.
    1. Anchor Network - Dev
    2. Aptos Network - Dev
    3. Solana Network - Dev 

- Try yourself.
    1. [iNFT Template Editor]("https://");
    2. [iNFT Minter]("https://");
    3. [iNFT Market]("https://");

## Dapps

### Editor

- It is the tools for designer to set the parameters for iNFT. Only the source image needed, the iNFT parts can be added here.

- Multi networks support, you can write the iNFT template on different blockchain network.

- Single iNFT file upload/download support.

### Minter

- The client Dapp for normal users. 

- Customer can explorer the templates, then mint on selected template.

- The list of result can be checked from minter.

- In some network, you can manage your account here.

### Market

- Selling market of iNFT result. Customers can price the NFT themselves.

- Different networks supported.

## Definition of iNFT

- The template of iNFT definition as follow.

    ```Javascript
        //iNFT template
        {
            type:"2D",
            size:[
                "OUTPUT_SIZE_X",
                "OUTPUT_SIZE_Y"
            ],
            puzzle:[        //pieces of iNFT. Will render by the array order, 0 is the background
                    {
                        value:[      //where to get the number of hash
                            "START",        //start position of hash string
                            "STEP",         //how many string to get from
                            "DIVIDE" ,      //how to divide, result%n, the value of "n"
                            "OFFSET",       //Random number offset to avoid same result
                            ],
                        img:[       //the position of image start, get by order, related ti "hash"
                            "LINE",         //line number of iNFT resource
                            "ROW",          //row number of iNFT resource
                            "LINE_EXT",     //default is 0,optional, line extend 
                            "ROW_EXT"       //default is 0,optional, row extend 
                            ],    //LINE_EXT and ROW_EXT is optional
                        position:[  //Position of this piece
                            "POSITION_X",   // The X position of this piece on iNFT
                            "POSITION_Y"    // The Y position of this piece on iNFT
                            ],
                        center:[    //this is optional, default is center of cell
                            "X",            //center X position        
                            "Y"             //center Y position     
                        ],
                        rotation:[  //this is optional 
                            "IMAGE_ROTATION",
                            "ROTATION_POSITION_X",
                            "ROTATION_POSITION_Y",
                        ],      
                        scale:1,                        //this is optional        
                        fill:1,                         //this is optional, wether fill the empty background     
                        color:[     //this is optional
                            "START",        //start position of hash string 
                            "STEP",         //default is 6,optional
                            "DIVIDE",       //optional, reduce the color amount. 
                            ["RED_OFFSET","GREEN_OFFSET","BLUE_OFFSET"]     //optional, adjust the color
                        ],
                        rarity:[            //How the part categoried to series. Parts can be multi used.
                            ["INDEX","INDEX", ... ],    //index parts, such as [0,2,3]
                            ["INDEX","INDEX", ... ],
                            ["INDEX","INDEX", ... ],
                        ]
                    },
                    ...         //iNFT is combined by pieces
                ]
            version:"VERSTION",     //iNFT template
            auth:["AUTH_NAME"]      //auth name list
        }
    ```

## Resource

- How to mint a NFT [https://support.opensea.io/hc/en-us/articles/360063498313-How-do-I-create-an-NFT](https://support.opensea.io/hc/en-us/articles/360063498313-How-do-I-create-an-NFT)