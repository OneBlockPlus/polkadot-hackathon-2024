import { Row } from "react-bootstrap";
import { useEffect, useState } from "react";

import RowHash from "./row_hash";
import tools from "../lib/tools";

/* iNFT hash animation board
*   @param  {string}    hash            //hash needed to render the iNFT
*   @param  {integer}   [grid]          //the length to slice hash to array
*   @param  {boolean}   [pending]       //set the "running" status to false
*/


let running=false;      //running status, if get new hash, set to true;
let pre_hash=null;      //default hash
let timer=null;

function AnimateHash(props) {
    const size = {
        row: [12],
    };

    const config={
        grid:!props.grid?16:props.grid,      //the amount of a row
        warning:"#ffc107",                  //warning color
        default:"#666666",
        single:30,                          //single character width
        //step:24,                            //animation step
        indentation:3,
    };

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

    const self={
        toArray:(hash,step)=>{
            const len=hash.length;
            const page=Math.ceil(len/step);
            const data={
                section:[],         //hash sections sliced by grid length
                group:[],           //position tag
                color:[],           //charactor color
            }

            for(let i=0;i<page;i++){
                const start=i*step;
                const end=start+step;
                const color=hash.slice(len-6,len);
                data.section.push(hash.slice(start,end));
                data.group.push(Array(step).fill(0));               
                data.color.push(Array(step).fill(`#${color}`));
            }
            return data;
        },
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

        calcNewSection:()=>{
            const group=[];
            const color=[];

        },
        //check which section is effected
        getEffectSection:(step,indentation,row)=>{
            const arr=[];
            for(let i=0;i<row;i++){
                if(step>i*indentation) arr.push(i);
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
                //console.log(JSON.stringify(atom));
                arr.push(atom)
            }
            
            return arr;
            //return [];
        },
        animate:(hash_now)=>{
            const pure_now= hash_now.slice(2);
            const matrix_now=self.toArray(pure_now,config.grid);
            const pure_old= pre_hash.slice(2);
            const matrix_old=self.toArray(pure_old,config.grid);

            let step=0;     //major animation actions
            timer=setInterval(()=>{
                if(step>=animate_group.length){
                    pre_hash=hash_now;
                    return clearInterval(timer);
                } 
                const alist=self.combine(tools.clone(matrix_now),tools.clone(matrix_old),animate_group[step]);
                setList(alist);
                step++;
            },60);
        },
        start:(hash_now)=>{
            const pure= hash_now.slice(2);
            const matrix=self.toArray(pure,config.grid);
            const nlist=self.group(matrix);
            setList(nlist);
        },
    }

    useEffect(() => {
        //console.log(props);
        //self.start(props.hash);
        if(!running){
            self.start(props.hash);
            pre_hash=props.hash;        //set to default hash
            running=true;
        }else{
            self.animate(props.hash);
        }
    }, [props.hash,props.pending]);

    return (
        <Row className="unselect pt-2">
            {list.map((row, index) => (
                <RowHash key={index} color={row.color} data={row.section}/>
            ))}
        </Row>
    )
}

export default AnimateHash;