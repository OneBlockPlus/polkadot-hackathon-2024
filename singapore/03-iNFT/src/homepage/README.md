# W3OS iNFT Hompage

W3OS iNFT hompage is the website relying on React which is a popular framework to develop web2.0/web1.0 applications.

## Overview

- This project is a full on-chain demo, try this to find out Anchor Network easy way to deploy your application on blockchain.

- The homepage application is base on React. The convertor tools is base on NodeJS.

- Parameters, which can be sent to application. `#${anchor_name}[?][key=value]#`

## Deployment

- You need **Convertor** to help you to do the job. It is pretty simple, just one setting file to modify and one command line to run it.

- Setting file sample.

    ```JSON
    {  
        "name":"inft_home",
        "framework":"frame_react.js",
        "version":"1.0.2",
        "related":{
            "js":"home_js",
            "css":"home_css",
            "resource":"res_data",
            "resource_ref":"home_map"
        },
        "directory":"package/homepage",
        "asset":"asset-manifest.json",
        "globalVars":[],
        "blockmax":1500000,
        "ignor":{
            "files":{
                "asset-manifest.json":true,
                "favicon.ico":true,
                "index.html":true,
                "manifest.json":true,
                "logo192.png":true,
                "logo512.png":true,
                "robots.txt":true,
                ".DS_Store":true
            },
            "folder":{
                "js":true,
                "css":true,
                ".DS_Store":true
            },
            "system":{
                ".DS_Store":true
            }
        },
        "server":"ws://127.0.0.1:9944",
        "account":{
            "password":"",
            "seed":"Alice"
        }
    }
    ```

- Command line to run.

    ```SHELL
        node converter_react_v3.js package/config_homepage.json 
    ```
