const prefix="ii_";
const keys={
    login:`${prefix}user`,
    list:`${prefix}list`,
    template:`${prefix}tpl`,
    down:`${prefix}download`,

    prefix:`${prefix}prefix`,       //iNFT prefix
    pointer:`${prefix}index`,       //iNFT record index pointer
    version:`${prefix}version`,     //iNFT minter version

    mint:`${prefix}mint`,           //isolate by account

    task: `${prefix}task`,
}

const self={
    set:(key,value)=>{
        //console.log(key,value);
        if(keys[key]===undefined) return false;
        const name=keys[key];
        localStorage.setItem(name,value);
        return true;
    },
    get:(key)=>{
        //console.log(map);
        if(keys[key]===undefined) return false;
        const name=keys[key];
        return localStorage[name];
    },
    remove:(key)=>{
        if(keys[key]===undefined) return false;
        const name=keys[key];
        localStorage.removeItem(name);
    },
};

export default self;