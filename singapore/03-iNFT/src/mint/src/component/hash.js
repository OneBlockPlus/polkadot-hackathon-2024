import { Row } from "react-bootstrap";
import { useEffect, useState } from "react";

import Data from "../lib/data";
import RowHash from "./row_hash";
import RowPart from "./row_part";

import tools from "../lib/tools";

//show the hash used by iNFT.
let running=false;      //running status, if get new hash, set to true;
let pre_hash=null;      //default hash

function Hash(props) {
    const size = {
        row: [12],
    };

    const config={
        single:16,              //single char width
        grid:16,                //the amount of a row
        warning:"#ffc107",      //warning color
        animation:80,           //slide in animation total time
        indentation:3,
    };

    //FIXME, animation group, need to impl a function
    const animate_group=[     //animation table
        [[16,0],[16,0],[16,0],[16,0]],      //step 0
        [[15,1],[16,0],[16,0],[16,0]],      //step 1
        [[14,2],[16,0],[16,0],[16,0]],      //step 2
        [[13,3],[16,0],[16,0],[16,0]],      //step 3
        [[12,4],[15,1],[16,0],[16,0]],      //step 4
        [[11,5],[14,2],[16,0],[16,0]],      //step 5
        [[10,6],[13,3],[16,0],[16,0]],      //step 6
        [[9,7],[12,4],[15,1],[16,0]],      //step 7
        [[8,8],[11,5],[14,2],[16,0]],      //step 8
        [[7,9],[10,6],[13,3],[16,0]],      //step 9
        [[6,10],[9,7],[12,4],[15,1]],      //step 10
        [[5,15],[8,8],[11,5],[14,2]],      //step 11
        [[4,14],[7,9],[10,6],[13,3]],      //step 12
        [[3,13],[6,10],[9,7],[12,4]],      //step 13
        [[2,14],[5,11],[8,8],[11,5]],      //step 14
        [[1,15],[4,12],[7,9],[10,6]],      //step 15
        [[0,16],[3,13],[6,10],[9,7]],      //step 16
        [[0,16],[2,14],[5,11],[8,8]],      //step 17
        [[0,16],[1,15],[4,12],[7,9]],      //step 18
        [[0,16],[0,16],[3,13],[6,10]],      //step 19
        [[0,16],[0,16],[2,14],[5,11]],      //step 20
        [[0,16],[0,16],[1,15],[4,12]],      //step 21
        [[0,16],[0,16],[0,16],[3,13]],      //step 22
        [[0,16],[0,16],[0,16],[2,14]],      //step 23
        [[0,16],[0,16],[0,16],[1,15]],      //step 24
        [[0,16],[0,16],[0,16],[0,16]],      //step 24
    ]

    let [list, setList]=useState([]);
    //let [grid, setGrid]=useState(16);

    let timer=null;

    const self={
        //convert single string hash to render structure.
        toArray:(hash,step)=>{
            const len=hash.length;
            const page=Math.ceil(len/step);
            const data={
                section:[],
                group:[],
                color:[],
            }

            for(let i=0;i<page;i++){
                const start=i*step;
                const end=start+step;
                const color=hash.slice(len-6,len);
                data.section.push(hash.slice(start,end));
                data.group.push(Array(step).fill(0))
                data.color.push(Array(step).fill(`#${color}`));
            }
            return data;
        },

        //tag the part position in group array
        calcPosition:(group,parts,step)=>{
            for(let i=0;i<parts.length;i++){
                const [start,offset]=parts[i].value;
                const row=Math.floor(start/step);
                const line=start%step;
                const index=i+1;
                for(let j=0;j<offset;j++){

                    //FIXME, here to calc the end situation
                    group[row][line+j]=index;
                }
            }
            return group;
        },
        //tag the used value of hash
        calcColor:(color,group,warn_color)=>{
            for(let i=0;i<group.length;i++){
                for(let j=0;j<group[i].length;j++){
                    if(group[i][j]!==0) color[i][j]=warn_color;
                }
            }
            return color;
        },
        //prepare the list for React rendering.
        group:(matrix)=>{
            const arr=[];
            for(let i=0;i<matrix.group.length;i++){
                arr.push(
                    {
                        group:matrix.group[i],
                        section:matrix.section[i],
                        color:matrix.color[i],
                    }
                )
            }
            return arr;
        },
        combine:(m_now,m_old,pointer)=>{
            const arr=[];
            for(let i=0;i<m_now.color.length;i++){
                const sec=pointer[i];

                const color=[];
                const group=[];
                for(let ii=0;ii<16;ii++){
                    if(ii<sec[0]){
                        group.push(m_old.group[i][ii]);
                        color.push(m_old.color[i][ii]);
                    }else{
                        group.push(m_now.group[i][ii]);
                        color.push(m_now.color[i][ii]);
                    } 
                }

                const atom={
                    group: group,
                    section:(m_old.section[i].slice(16-sec[0],16)+m_now.section[i].slice(0,sec[1])),
                    color:color,
                }
                arr.push(atom)
            }
            return arr;
        },
        animate:(hash_now,ck)=>{
            const pure_now= hash_now.slice(2);
            const matrix_now=self.toArray(pure_now,config.grid);
            const pure_old= pre_hash.slice(2);
            const matrix_old=self.toArray(pure_old,config.grid);
            
            let step=0;     //major animation actions
            timer=setInterval(()=>{
                if(step>=animate_group.length){
                    pre_hash=hash_now;
                    clearInterval(timer);
                    return ck && ck();
                } 
                const alist=self.combine(tools.clone(matrix_now),tools.clone(matrix_old),animate_group[step]);
                setList(alist);
                step++;
            },config.animation);
        },

        //convert the interval to ats;
        speed:(n,step)=>{
            const single=parseInt(n/step);
            return Array(step).fill(single);
        },

        fresh:()=>{
            if(timer!==null) clearInterval(timer);
            const pure= props.hash.slice(2);
            const matrix=self.toArray(pure,config.grid);
            //setGrid(matrix.group[0].length);

            const tpl=Data.get("template");
            if(tpl!==null){
                matrix.group=self.calcPosition(matrix.group,tpl.parts,config.grid); 
                matrix.color=self.calcColor(matrix.color,matrix.group,config.warning);
            }

            const nlist=self.group(matrix);
            setList(nlist);
        },
    }

    useEffect(() => {
        if(!running){
            self.fresh();
            pre_hash=props.hash;        //set to default hash
            running=true;
        }else{
            self.animate(props.hash,()=>{
                self.fresh();
            });
        }
    }, [props.hash]);

    return (
        <Row className="unselect">
            {list.map((row, index) => (
                <div key={index}>
                    <RowHash color={row.color} data={row.section}/>
                    <RowPart group={row.group} data={row.section} active={props.active}/>
                </div>
            ))}
        </Row>
    )
}

export default Hash;