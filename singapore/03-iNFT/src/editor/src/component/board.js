import { Row, Col, Form } from "react-bootstrap";
import { useEffect, useState } from "react";

import Value from "./value";

import Data from "../lib/data";
import Render from "../lib/render";
import ETH from "../lib/eth";

import tools from "../lib/tools";
//context.drawImage(img, sx, sy, swidth, sheight, x, y, width, height)

const cfg = {
    id: "NFT_canvas",
    //width: 400,
    //height: 400,
}

function Board(props) {
    const size = {
        row: [12],
        hash: [8, 4],
        rare: [8, 4],
        rate: [3, 9],
    };

    let [width, setWidth] = useState(400);
    let [height, setHeight] = useState(400);

    let [hash, setHash] = useState("0x0e70dc74951952060b5600949828445eb0acbc6d9b8dbcc396c853f8891");
    let [highlight, setHighlight] = useState(true);
    let [series, setSeries] = useState([]);
    let [rate, setRate] = useState(0);
    let [win, setWin] = useState("");

    // let [start, setStart] = useState(0);
    // let [step, setStep] = useState(0);
    // let [divide, setDivide] = useState(1);
    // let [offset, setOffset] = useState(0);

    let [stage, setStage]=useState(<Value start={0} step={0} divide={8} offset={0} hash={hash} />);

    if (Data.get("hash") === null) {
        Data.set("hash", hash);
    }

    const self = {
        changeHash: (ev) => {
            setHash(ev.target.value);
            Data.set("hash", ev.target.value);
            props.fresh();
        },
        changeHighlight: (ev) => {
            setHighlight(!highlight);
            props.fresh();
        },
        clickFresh: () => {
            Data.set("hash", self.randomHash(64));
            props.fresh();
        },
        randomHash: (n) => {
            const str = "01234567890abcdef";
            let hex = "0x";
            for (let i = 0; i < n; i++) hex += str[tools.rand(0, str.length - 1)];
            return hex;
        },
        calcRarity: (puzzle, series) => {
            for (let i = 0; i < series.length; i++) {
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
        getTotalRate: (series) => {
            let rate = 0;
            for (let i = 0; i < series.length; i++) {
                if(series[i].rate!==0) rate += 1/series[i].rate;
            }
            return rate;
        },
        calcResult: (hash, parts, s_amount) => {
            //console.log(hash,parts,series);
            let series = [];
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const [hash_start, hash_step, amount, offset] = part.value;
                const num = parseInt("0x" + hash.substring(hash_start + 2, hash_start + 2 + hash_step));
                const index = (num + offset) % amount;
                if (part.rarity === undefined) continue;

                const rlist = part.rarity;
                const in_asset = [];
                for (let j = 0; j < rlist.length; j++) {
                    const asset = rlist[j];
                    if (asset.includes(index)) {
                        in_asset.push(j);
                    }
                }
                series.push(in_asset);
            }
            //console.log(series);

            const index = [];
            for (let i = 0; i < s_amount; i++) {
                let not = false;           //i系列是否被包括了
                for (let j = 0; j < parts.length; j++) {
                    const arr = series[j];
                    if (!arr.includes(i)) not = true;
                }

                if (!not) index.push(i);
            }

            if (index.length === 0) return false;
            //console.log(series);
            return index;
        },
        decode: (hash, pen, img, parts, tpl, active) => {
            const { cell, grid } = tpl;
            const multi = 1;
            let cache = null;
            for (let i = 0; i < parts.length; i++) {
                //获取不同的图像
                const part = parts[i];
                const [hash_start, hash_step, amount, offset] = part.value;
                const [gX, gY, eX, eY] = part.img;
                const [px, py] = part.position;
                const [zx, zy] = part.center;

                const num = parseInt("0x" + hash.substring(hash_start + 2, hash_start + 2 + hash_step));
                const index = (num + offset) % amount;     //图像的位次
                const max = Math.floor(grid[0] / (1 + eX)); //处理无法整除的情况
                const br = Math.floor((index + gX) / max);

                const cx = cell[0] * (eX + 1) * ((index + gX) % max);
                const cy = cell[1] * gY + br * cell[1] * (1 + eY);
                const dx = cell[0] * (eX + 1);
                const dy = cell[1] * (eY + 1);
                const vx = px - zx * cell[0] * (1 + eX);
                const vy = py - zy * cell[1] * (1 + eY);
                pen.drawImage(img, cx * multi, cy * multi, dx * multi, dy * multi, vx, vy, dx, dy);

                if (active === i) {
                    cache = [dx, dy, vx, vy, "#FF0000", 2];
                }
            }

            if (cache !== null) {
                const [dx, dy, vx, vy, color, pw] = cache
                Render.active(pen, dx, dy, vx, vy, color, pw);
            }
        },
        autofresh: (hash) => {
            const def = Data.get("NFT");
            const bs64 = Data.get("template");
            const pen = Render.create(cfg.id);
            if(def===null) setStage(<Value start={0} step={0} divide={8} offset={0} hash={hash} />);

            const ss = Data.get("size");
            const selected = Data.get("selected");

            if (selected !== null && def!==null) {
                const part = def.puzzle[selected];
                const [p_start, p_step, p_divide, p_offset] = part.value;
                setStage(<Value start={p_start} step={p_step} divide={p_divide} offset={p_offset} hash={hash} />)
            }

            if(bs64 === null || def === null) {
                Render.fill(pen);
                return true;
            }

            const img = new Image();
            img.src = bs64;
            img.onload = (e) => {
                //Render.clear(cfg.id);
                const active = Data.get("selected");
                self.decode(hash, pen, img, def.puzzle, ss, highlight ? active : undefined);

                const rlist = self.calcRarity(def.puzzle, def.series);
                setSeries(rlist);
                const rt=self.getTotalRate(rlist);
                setRate(rt===0?"":parseInt(1/rt));

                const sarr = self.calcResult(hash, def.puzzle, def.series.length);
                if (sarr !== false) {
                    let min = undefined;
                    for (let i = 0; i < sarr.length; i++) {
                        const tindex = sarr[i];
                        const rare = rlist[tindex].rate;
                        if (min === undefined) min = rare;
                        if (rare > min) min = rare
                    }
                    setWin((<p>Series {JSON.stringify(sarr)}: <br/>Rate: 1 / {self.getThound(min)}</p>))
                } else {
                    setWin("")
                }
            }

        },
        getThound:(n)=>{
            //console.log(n);
            if(n===undefined) return "";    //加了这行久好了
            return n.toLocaleString();
        }
    }

    useEffect(() => {
        setHash(Data.get("hash"));
        const { target } = Data.get("size");
        const tpl=Data.get("template");
        if(tpl!==null){
            setWidth(target[0]);
            setHeight(target[1]);
            setTimeout(()=>{
                self.autofresh(Data.get("hash"));
            },50);
        }else{
            setStage(<Value start={0} step={0} divide={8} offset={0} hash={hash} />);
            setSeries([]);
            setRate(0);
            setWin("");
            Render.create(cfg.id);
            //Render.clear(cfg.id);
        }

    }, [props.update]);

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <h5>iNFT Preview</h5>
            </Col>
            <Col className="pt-2" lg={size.hash[0]} xl={size.hash[0]} xxl={size.hash[0]} >
                <small>{hash.length - 2} bytes hexadecimal mock hash.</small>
                {stage}
                {/* <Value start={start} step={step} divide={divide} offset={offset} hash={hash} update={props.update}/> */}
            </Col>
            <Col className="pt-2" lg={size.hash[1]} xl={size.hash[1]} xxl={size.hash[1]} >
                <Row>
                    <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                        <Form>
                            {/* <Form.Check type="checkbox" label={`Enable hash check.`} /> */}
                            <Form.Check type="checkbox" label={`Enable highlight.`} checked={highlight} onChange={(ev) => {
                                self.changeHighlight(ev);
                            }} />
                        </Form>
                    </Col>
                    <Col className="text-center pt-4" lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                        <button className="btn btn-md btn-warning" onClick={(ev) => {
                            self.clickFresh();
                        }}>Mock Mint</button>
                    </Col>
                </Row>
            </Col>
            <Col className="text-center pt-4" lg={size.rare[0]} xl={size.rare[0]} xxl={size.rare[0]} >
                <canvas width={width} height={height} id={cfg.id}></canvas>
            </Col>
            <Col className="pt-2" lg={size.rare[1]} xl={size.rare[1]} xxl={size.rare[1]} >
                <Row className="pb-2">
                    <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                        Total Rarity:<br />1 / {rate.toLocaleString()}
                    </Col>
                </Row>
                {series.map((row, index) => (
                    <Row key={index}>
                        <Col lg={size.rate[0]} xl={size.rate[0]} xxl={size.rate[0]}>
                            #S_{index}
                        </Col>
                        <Col className="text-end" lg={size.rate[1]} xl={size.rate[1]} xxl={size.rate[1]}>
                            1 / {self.getThound(row.rate)}
                        </Col>
                    </Row>
                ))}
                <Row className="pt-4">
                    <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                        Mint Result:<br /> {win}
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

export default Board;