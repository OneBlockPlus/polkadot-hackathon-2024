import { Row, Col, Card, Placeholder } from "react-bootstrap";
import { useEffect, useState } from "react";

import Render from "../lib/render";
import tools from "../lib/tools";
import TPL from "../system/tpl";
import INFT from "../system/inft";

import { FaAnchor } from "react-icons/fa";

/* iNFT list component
*   @param  {array}     data            //iNFT[], list of iNFT to show
*   @param  {string}    network         //network
*/

function ListNFTs(props) {
  const size = {
    row: [12],
    grid: [3],
  };

  let [list, setList] = useState([]);
  let [ready, setReady] = useState(false);
  let [info, setInfo] = useState("");

  const self = {
    getHolder: (n) => {
      const arr = []
      for (let i = 0; i < n; i++) {
        arr.push({ name: "#" + i });
      }
      return arr;
    },
    getTemplates: (list, ck) => {
      //1.filter out all template cid
      const map = {};
      for (let i = 0; i < list.length; i++) {
        const row = list[i];
        if (row && row.raw && row.raw.tpl) map[row.raw.tpl] = true;
      }

      //get cid array
      const tpls = [];
      for (var cid in map) tpls.push(cid);
      TPL.cache(tpls, ck);
    },
    getThumbs: (list, ck, imgs) => {
      if (imgs === undefined) {
        list = tools.copy(list);
        imgs = {}
      }
      if (list.length === 0) return ck && ck(imgs);
      const row = list.pop();
      //console.log(row);
      TPL.view(row.raw.tpl, (def) => {
        const basic = {
          cell: def.cell,
          grid: def.grid,
          target: def.size
        }
        const offset = !row.raw.offset ? [] : row.raw.offset;
        Render.thumb(row.hash, def.image, def.parts, basic, offset, (img) => {
          imgs[row.name] = img;
          return self.getThumbs(list, ck, imgs)
        });
      })
    },
    formatResult: (list, imgs) => {
      const arr = [];
      for (let i = 0; i < list.length; i++) {
        const row = list[i];
        arr.push({
          name: row.name,
          signer: row.signer,
          network: row.network,
          bs64: imgs[row.name],
        });
      }
      return arr;
    },
    showThumb: (bs64) => {
      if (!bs64) return `${window.location.origin}/imgs/logo.png`;
      return bs64;
    },
    getOwner:(row)=>{

    },
  }

  useEffect(() => {
    if (props.data.length === 0) {
      setInfo("No iNFTs.");
      setList([]);
    } else {
      setInfo("");
      const nlist = self.getHolder(props.data.length);
      setList(nlist);

      INFT.auto(props.data, (iNFTs) => {
        setList(iNFTs);
        setReady(true);
      });
    }
  }, [props.data]);

  return (
    <Row>
      <Col className="pt-4" hidden={!info ? true : false} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <h4>{info}</h4>
      </Col>
      {list.length!==0 && list.map((row, index) => (     
        <Col key={index} className="pt-2" lg={size.grid[0]} xxl={size.grid[0]} md={size.grid[0]}>
          <Card hidden={!ready} style={{ width: "100%" }}>
            <a href={`/view/${row.name}`} target="blank">
              <Card.Img variant="top" src={self.showThumb(row.bs64)} />
            </a>
            <Card.Body>
              <Card.Title>{row.name}</Card.Title>
              <Card.Text>
                Owner: {!row.owner ? "" : tools.shorten(row.owner,8)}
                <br/>
                <FaAnchor /><span className="pt-1 ml-10">{parseInt(row.block).toLocaleString()}</span>
              </Card.Text>
            </Card.Body>
          </Card>

          <Card hidden={ready} style={{ width: "100%" }}>
            <Card.Img variant="top" src={`${window.location.origin}/imgs/logo.png`} />
            <Card.Body>
              <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={6} />
              </Placeholder>
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{" "}
                <Placeholder xs={6} /> <Placeholder xs={8} />
              </Placeholder>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
export default ListNFTs;