import Local from "./local";

const queue=[
    20240103,
    20240102,
    20240101
];

const update={
    20240102:()=>{  //get current version
        console.log(`Run update 20240102`);
        const fa=Local.get("mint");
        if(fa){
            try {
                const map=JSON.parse(fa);
                for(var k in map){
                    map[k].proxy=true;
                    if(map[k].template){
                        for(var kk in map[k].template){
                            map[k].template[kk].way=1;
                        }
                    }
                }
                Local.set("mint",JSON.stringify(map));
            } catch (error) {
                console.log(`Run update 20240102`);
            }
        }
    },
    20240101:()=>{  //get current version
        //1.remove the "task" "pointer" "prefix" localstorage
        //2.remvoe the "mint" localstorage, structure updated
        console.log(`Run update 20240101`);
        Local.remove("prefix");
        Local.remove("pointer");
        Local.remove("task");
        Local.remove("mint");
    },
}

const self={
    auto:(cur_version)=>{
        //console.log(`Current version ${cur_version}, old version: ${old}`); 
        const old=Local.get("version");
        if(cur_version>old){
            for(let i=0;i<queue.length;i++){
                const key=queue[i];
                if(key>=old && key<cur_version && update[key])update[key]();
            }
        }
        Local.set("version",queue[0]);
    },  
}
export default self;