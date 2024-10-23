import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import { FaPlus,FaTrashAlt } from "react-icons/fa";

import  Data from "../lib/data";
import tools from "../lib/tools";

function Series(props) {

    const size = {
        row: [12],
        title:[8,4],
        list:[8,4],
    };

    let [series,setSeries]=useState([]);

    const self={
        clickAdd:(ev)=>{
            const def=Data.get("NFT");
            if(def===null) return false;
            if(def.series===undefined) def.series=[];

            //1.增加系列
            def.series.push({name:"",desc:""});
            const sum=def.series.length;

            //2.整理puzzle里的rarity的数据
            for(let i=0;i<def.puzzle.length;i++){
                if(!def.puzzle[i].rarity) def.puzzle[i].rarity=[];
                def.puzzle[i].rarity=self.getNewRarity(def.puzzle[i].rarity,sum)
            }

            self.save(def);
        },
        clickRemove:(index)=>{
            const def=Data.get("NFT");
            if(def===null) return false;
            def.series=self.getArrayRemoved(def.series,index);

            for(let i=0;i<def.puzzle.length;i++){
                if(!def.puzzle[i].rarity) def.puzzle[i].rarity=[];
                def.puzzle[i].rarity=self.getArrayRemoved(def.puzzle[i].rarity,index)
            }
            self.save(def);
        },
        changeName:(index,ev)=>{
            const val=ev.target.value.trim();
            series[index].name=val;
            const ns=tools.clone(series);
        
            const def=Data.get("NFT");
            def.series=ns;
            self.save(def);
        },
        changeDesc:(index,ev)=>{
            const val=ev.target.value.trim();
            series[index].desc=val;
            const ns=tools.clone(series);
        
            const def=Data.get("NFT");
            def.series=ns;
            self.save(def);
        },
        getArrayRemoved:(list,index)=>{
            const arr=[];
            for(let i=0;i<list.length;i++){
                if(i!==index) arr.push(list[i]);
            }
            return arr;
        },
        getNewRarity:(old,sum)=>{
            const result=[];
            for(let i=0;i<sum;i++){
                if(old!==undefined && old[i]!==undefined){
                    result.push(tools.clone(old[i]));
                }else{
                    result.push([]);
                }
            }
            return result;
        },
        save:(def)=>{
            Data.set("NFT", tools.clone(def));
            props.fresh();
        },
        calcRarity:(puzzle,series)=>{
            for(let i=0;i<series.length;i++){
                //series[i].rate=1;
                let n=1;
                let m=1;
                for(let j=0;j<puzzle.length;j++){
                    const part=puzzle[j];
                    const max=part.value[2];
                    const bingo=part.rarity[i];
                    n=n*bingo.length;
                    m=m*max;
                    if(n!==0){
                        series[i].rate=parseInt(m/n);
                    }else{
                        series[i].rate=0;
                    }
                }
            }
            return series;
        },
    };

    useEffect(() => {
        const tpl=Data.get("template");
        const def=Data.get("NFT");
        if(tpl!==null && def!==null){
            if(def.series===undefined) def.series=[];
            const nlist=self.calcRarity(def.puzzle,def.series);
            setSeries(nlist);
        }else{
            setSeries([]);
        }

    }, [props.update]);

    return (
        <Row className="pt-4">
            <Col lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]}>
                <h5>iNFT Series</h5>
            </Col>
            <Col className="text-end" lg={size.title[1]} xl={size.title[1]} xxl={size.title[1]}>
                <FaPlus style={{ color: "rgb(13, 110, 253)", cursor: "pointer" }} onClick={(ev)=>{
                    self.clickAdd(ev);
                }}/>
            </Col>
            {series.map((row, index) => (
                <Col key={index} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                    <Row className="pb-2 pt-2">
                        <Col lg={size.list[0]} xl={size.list[0]} xxl={size.list[0]}>
                            #S_{index} {row.name}
                        </Col>
                        <Col className="text-end" lg={size.list[1]} xl={size.list[1]} xxl={size.list[1]}>
                        <FaTrashAlt style={{ color: "rgb(13, 110, 253)", cursor: "pointer" }} onClick={(ev)=>{
                            self.clickRemove(index);
                        }}/>
                        </Col>
                        <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                            <small>Name of series</small>
                            <input type="text" className="form-control" value={row.name} onChange={(ev)=>{
                                self.changeName(index,ev);
                            }}/>
                        </Col>
                        <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                            <small>Description of series</small>
                            <textarea className="form-control" cols="30" rows="2" defaultValue={row.desc} onChange={(ev)=>{
                                self.changeDesc(index,ev);
                            }}></textarea>
                        </Col>
                    </Row>
                </Col>
            ))}
        </Row>
    )
}

export default Series;