import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import  Data from "../lib/data";
import tools from "../lib/tools"

function Rarity(props) {
    const size = {
        row: [12],
        title: [8, 4],
        select:[4,8],
        button:[2],
    };

    let [ series, setSeries]=useState([]);

    const self={
        clickRare:(series,index)=>{
            const def=Data.get("NFT");
            const active=props.index;
            if(!def.puzzle || !def.puzzle[active]) return false;
            const target=def.puzzle[active].rarity;

            if(!target[series].includes(index)){
                target[series].push(index);
            }else{
                const arr=[];
                for(let i=0;i<target[series].length;i++){
                    const atom=target[series][i];
                    if(atom!==index) arr.push(atom);
                }
                target[series]=arr;
            }
            def.puzzle[active].rarity=target;
            Data.set("NFT",tools.clone(def));
            props.fresh();
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
        getMatrix:(rarity,max,series)=>{
            const nlist=[];
            for(let i=0;i<series;i++){
                if(rarity!==undefined && rarity[i]!==undefined){
                    nlist.push(self.fillArray(rarity[i],max));
                }else{
                    nlist.push(self.fillArray([],max));
                }
            }
            return nlist;
        },
        fillArray:(arr,max)=>{
            const nlist=[];
            for(let i=0;i<max;i++){
                nlist.push(arr.includes(i)?1:0);
            }
            return nlist;
        },
        getSeriesName:(index)=>{
            const def=Data.get("NFT");
            if(!def.series[index] || !def.series[index].name) return "";
            return def.series[index].name;
        },
    }

    useEffect(() => {
        const active=props.index;
        const def=Data.get("NFT");
        const dt=def.puzzle[active];
        const sum=def.series===undefined?0:def.series.length;
        const list=self.getMatrix(dt.rarity,dt.value[2],sum);
        setSeries(list);
    }, [props.index,props.update]);

    return (
        <Row className="pt-4">
            <Col lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]}>
                <h5>iNFT Part"s Rarity</h5>
            </Col>
            <Col  lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                {series.map((row, index) => (
                    <Row key={index}>
                        <Col className="pt-2" lg={size.select[0]} xl={size.select[0]} xxl={size.select[0]}>
                            #S_{index} {self.getSeriesName(index)}
                        </Col>
                        <Col lg={size.select[1]} xl={size.select[1]} xxl={size.select[1]}>
                            <Row>
                                {row.map((single, skey) => (
                                    <Col key={skey} lg={size.button[0]} xl={size.button[0]} xxl={size.button[0]}>
                                        <button className={single?"btn btn-md btn-primary":"btn btn-md btn-default"} onClick={(ev)=>{
                                            self.clickRare(index,skey);
                                        }}>{skey}</button>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                        <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                            <hr/>
                        </Col>
                    </Row>
                ))}
            </Col>
        </Row>
    )
}

export default Rarity;