import { Row, Col, Table } from "react-bootstrap";
import { useEffect, useState } from "react";

import BountySubmit from "./bounty_submit";
import BountyProcess from "./bounty_process";
import BountyLoad from "./bounty_load";

import Config from "../system/config";
import Bounty from "../system/bounty";
import API from "../system/api";
import TPL from "../system/tpl";

import INDEXED from "../lib/indexed";

import { FaBitcoin, FaSyncAlt, FaSkullCrossbones, FaRoad } from "react-icons/fa";

function UserBounty(props) {
  const size = {
    row: [12],
  };

  let [list, setList] = useState([]);

  const def = Config.get(["bounty", "status"]);
  const nameDB = Config.get(["storage", "DBname"]);
  const table = "bounty";

  const self = {
    clickRemove: (name) => {
      //console.log(name);
      INDEXED.checkDB(nameDB, (db) => {
        if (INDEXED.checkTable(db.objectStoreNames, table)) {
          INDEXED.removeRow(db, table, "name", name, (done) => {
            if (done) self.fresh();
          });
        }
      });
    },
    clickPay: (name) => {
      props.dialog.show(<BountySubmit name={name} />, "Bounty Submission");
    },
    clickSync: (name) => {
      Bounty.get(name, (bt) => {
        if(bt.error) return false;
        //if (!dt || dt.length === 0) return false;
        //const bt = dt[0];
        console.log(bt);
        const name = bt.name;
        API.bounty.exsist(name, (res) => {
          if (!res.exsist) {
            const detail = {
              bonus: bt.bonus,
              desc: bt.desc,
              publish: bt.publish,
              payer: bt.payer,
            }
            API.bounty.submit(name, bt.coin, bt.start, bt.end, JSON.stringify(bt.template), JSON.stringify(detail), (res) => {
              console.log(res);
            });
          }
        });
      });
    },
    clickProcess: (name) => {
      props.dialog.show(<BountyProcess name={name} />, "Bounty Process Dashboard");
    },
    getThumb: (arr, ck, tpls, map) => {
      if (tpls && tpls.length === 0) return ck && ck(map);
      if (tpls === undefined) {
        const tpls = [];
        for (let i = 0; i < arr.length; i++) {
          const row = arr[i];
          tpls.push(row.template.cid);
        }
        return self.getThumb(arr, ck, tpls);
      }
      if (map === undefined) map = {};

      const cid = tpls.pop();
      TPL.view(cid, (dt) => {
        map[cid] = dt;
        return self.getThumb(arr, ck, tpls, map);
      });
    },
    fresh: () => {
      Bounty.list((arr) => {
        self.getThumb(arr, (map) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i].thumb = map[arr[i].template.cid].thumb;
          }
          //console.log(arr);
          setList(arr);
        });
      });
    }
  }

  useEffect(() => {
    self.fresh();
  }, []);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <BountyLoad fresh={""} />
      </Col>

      <Col className="pt-4" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <h5>Bounty List</h5>
      </Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Coin</th>
              <th>Alink</th>
              <th>Process</th>
              <th>Start</th>
              <th>End</th>
              <th>Created</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row, index) => (
              <tr key={index}>
                <td>
                  <a href={`http://localhost:3000/playground/${row.template.cid}`} target="_blank" rel="noreferrer">
                  <img className="template_icon" src={row.thumb} alt="template thumb" />
                  </a>
                </td>
                <td>
                  {row.title}
                </td>
                <td>
                  ${row.coin.toUpperCase()}
                </td>
                <td>
                  <a href="https://polkadot.js.org/apps/?rpc=ws://localhost:9944#/chainstate" target="_blank" rel="noreferrer">
                    {row.name}
                  </a>
                </td>
                <td>
                  <button className="btn btn-sm btn-default" onClick={(ev) => {
                    self.clickProcess(row.name);
                  }}>
                    <FaRoad size={20} />
                  </button>
                  <button className="btn btn-sm btn-default" onClick={(ev) => {
                    self.clickPay(row.name);
                  }}>
                    <FaBitcoin size={20} />
                  </button>
                </td>
                <td>
                  {row.start.toLocaleString()}
                </td>
                <td>
                  {row.end.toLocaleString()}
                </td>
                <td>
                  {(new Date(row.stamp).toLocaleDateString())}
                </td>
                <td>
                  <button className="btn btn-sm btn-default" onClick={(ev) => {
                    self.clickRemove(row.name);
                  }}>
                    <FaSkullCrossbones size={20} />
                  </button>

                  <button className="btn btn-sm btn-default" onClick={(ev) => {
                    self.clickSync(row.name);
                  }}>
                    <FaSyncAlt size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
}
export default UserBounty;