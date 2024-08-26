import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const self = {
    test_1: () => {    //连接到目标网络，并获取到基础数据
        const aptosConfig = new AptosConfig({ network: Network.DEVNET });
        const aptos = new Aptos(aptosConfig);
        //console.log(aptos);
        aptos.getLedgerInfo().then((res) => {
            console.log(aptos.getAccountInfo);

            const hash = "0x37b6d7677b65520139e1749157b319a424608b7e0b80dcf20044cb610537c632";
            aptos.getAccountInfo({ accountAddress: hash }).then((obj) => {
                console.log(obj);
            });
        }).catch((error) => {
            console.log(error);
        });
    },
    test_block_hash: () => {
        const aptosConfig = new AptosConfig({ network: Network.DEVNET });
        const aptos = new Aptos(aptosConfig);
        console.log(aptos);
        const block = 409021;
        //const hash="0x34a71c1f9e35656a05ab135180fab871303bd2e86fb742e1febf58be8f7ae8b1";
        aptos.getBlockByHeight({ blockHeight: block }).then((res) => {
            console.log(res);
        }).catch((error) => {
            console.log(error);
        });
    },
    test_height: () => {
        const aptosConfig = new AptosConfig({ network: Network.DEVNET });
        const aptos = new Aptos(aptosConfig);
        console.log(aptos);
        //const block=409021;
        //const hash="0x34a71c1f9e35656a05ab135180fab871303bd2e86fb742e1febf58be8f7ae8b1";
        // aptos.getName({name:Network.DEVNET}).then((res)=>{
        //     console.log(res);
        // }).catch((error)=>{
        //     console.log(error);
        // });
    },
    test_backup: () => {
        // const hash="0xf3bb69b6b1e680a87818f2c6178fc092a7036d5465f2ad2c18cad41bc9641e4c";
        // Chain.view(hash,"transaction",(res)=>{
        //     console.log(res);
        // });

        // const version_id = 19945359;
        // Chain.view(version_id, "transaction_version", (res) => {
        //     console.log(res);
        //     const trans_hash="0x93aa5b977b9e311525577e7deb04ab0e8b3b51df8777ba1840cde619cca0d004";
        //     Chain.view(res.state_change_hash, "transaction_hash", (res) => {
        //         console.log(res);
        //     });
        // });

        // const acc="0x37b6d7677b65520139e1749157b319a424608b7e0b80dcf20044cb610537c632";
        // Chain.view(acc,"token",(res)=>{
        //     console.log(res);
        // });

        // const hash="0xcb4b4da9380ccca7a7a22b09c67368ba51e72b602fa47b27bb8aaf2a12b46ea0";
        // const path=`${hash}::birds_nft::InftJson`;
        // Chain.view([hash,path],"resource",(res)=>{
        //     console.log(res);
        // });
    },
}

const AptOS_test = {
    auto: () => {
        //self.test_1();
        //self.test_block_hash();
        self.test_height();
    },
}
export default AptOS_test;