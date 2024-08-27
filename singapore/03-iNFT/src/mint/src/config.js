module.exports = {
    network:"anchor",
    //network:"tanssi",
    //network:"sui",
    node:[
        //"wss://fraa-flashbox-2690-rpc.a.stagenet.tanssi.network",
        //"wss://wss.android.im",
        "ws://127.0.0.1:9944",
        //"wss://dev2.metanchor.net",
    ],
    default:[
        "bafkreibtt7ciqypa3vogodmdmvyd3trwajv3l7cqi43yk4hrtgpyopn2e4",  //BTC tree
        //"bafkreiddy2rqwebw5gm5hdqqqrbsqzkrubjk3ldzr2bia5jk4w5o2w5w4i",  //APE
        //"bafkreihze725zh5uqcffao5w27qdmaihjffjzj3wvtdfjocc33ajqtzc7a",  //Solana logo
        //"anchor://single/265468",
        //"anchor://aabb/217148",
    ],
    faucet:{
        tanssi:"https://faucet.w3os.net",
        anchor:"",
    },
    agent:{
        inft:[
            "wss://wss.android.im",
        ],
        template:[
            "https://ipfs.w3os.net/"
        ],
    },
    unit:{
        anchor:"$ANK",
        tanssi:"$INFT",
    },
    proxy:true,             //system default proxy setting
    version:20240103,
}