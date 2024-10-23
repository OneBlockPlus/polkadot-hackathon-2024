import { useEffect, useState } from "react";

import Network from "../network/router";
import Data from "../lib/data";
import tools from "../lib/tools";

function SettingNetwork(props) {

    const cur=Data.getHash("cache","network");
    let [value, setValue]=useState(cur);
    let [list, setList]=useState([]);
    
    const self={
        changeNetwork:(ev)=>{
            const net=ev.target.value;
            const dt=Network();
            setValue(net);
            if(dt[net] && dt[net]!==null){
                Data.setHash("cache","network",net);
                props.fresh();
            }
        },

        getValidNetwork:(ns)=>{
            const arr=[];
            for(let net in ns){
                if(ns[net]!==null) arr.push(net);
            }
            return arr;
        },
    }
    

    useEffect(() => {
        const dt=Network();
        const ns=self.getValidNetwork(dt);
        setList(ns);

    }, [props.update]);

    return(
        <select className="form-control" value={value} onChange={(ev)=>{
            self.changeNetwork(ev);
        }}>
            {list.map((row, index) => (
                <option value={row} key={index}>{tools.toUp(row)} Network</option>
            ))}
        </select>
    )
}

export default SettingNetwork;