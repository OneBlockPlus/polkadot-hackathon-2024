
const data={}

const self = {
    get:(list)=>{
        const map={};
        if(Array.isArray(list)){
            for(let i=0;i<list.length;i++){
                const uri=list[i];
                map[uri]=!data[uri]?9:data[uri];
            }
        }else{
            map[list]=!data[list]?9:data[list];
        }
        return map;
    },
    set:(url,code)=>{
        data[url]=code;
        return true;
    },
}

export default self;