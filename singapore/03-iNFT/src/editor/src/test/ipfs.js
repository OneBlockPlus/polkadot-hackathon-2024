import IPFS from "../network/ipfs";

const self={
    test_read:()=>{
        const cid="QmWFQoPE9ugTqjM3vYuZvRrrQ7LhmtG8GZeh1zDj62Hav5";
        IPFS.read(cid,(res)=>{
            console.log(res);
        })
    },
}

const IPFS_test= {
    auto:()=>{
        self.test_read();
    },
    
}
export default IPFS_test;