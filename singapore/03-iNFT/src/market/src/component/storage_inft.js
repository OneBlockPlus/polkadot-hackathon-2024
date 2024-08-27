import { Row, Col, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import { FaSkullCrossbones, FaSync, FaFileDownload } from "react-icons/fa";


import Page from "./common/common_page";

import tools from "../lib/tools";
import INDEXED from "../lib/indexed";

import Config from "../system/config";

function StorageINFT(props) {
  const size = {
    row: [12]
  };

  let [list, setList] = useState([]);
  let [page, setPage] = useState(1);
  let [total, setTotal] = useState(1);
  let [step, setStep] = useState(12);
  let [show, setShow] = useState(true);

  const nameDB = Config.get(["storage", "DBname"]);
  const table = "infts";

  const self = {
    clickRemove: (name) => {
      //console.log(name);
      INDEXED.checkDB(nameDB, (db) => {
        if (INDEXED.checkTable(db.objectStoreNames, table)) {
          INDEXED.removeRow(db, table, "name", name, (done) => {
            if (done) self.fresh(page);
          });
        }
      });
    },
    clickFresh: (name) => {
      console.log(name);
    },
    getDate: (stamp) => {
      return tools.day(stamp, "-");
    },
    count: (ck) => {
      INDEXED.checkDB(nameDB, (db) => {
        INDEXED.countTable(db, table, (max) => {
          setTotal(Math.ceil(max / step));
          return ck && ck();
        })
      });
    },
    fresh: (n) => {
      //console.log(total);
      INDEXED.checkDB(nameDB, (db) => {
        if (INDEXED.checkTable(db.objectStoreNames, table)) {
          INDEXED.pageRows(db, table, (res) => {
            if (res !== false) {
              setList(res);
            }
          }, { page: n, step: step });
        }
      });
    },
  };

  useEffect(() => {
    self.count(() => {
      self.fresh(page);
    });
  }, [props.update]);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>iNFT</th>
              <th>Last</th>
              <th>Share</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row, index) => (
              <tr key={index}>
                <td>
                  <span className="ml-5"> <img className="template_icon" src={row.thumb} alt="template thumb" /></span>
                  <span className="ml-5">{row.name}</span>
                </td>
                <td>{self.getDate(row.stamp)}</td>
                <td>
                  <span className="pointer" onClick={(ev) => {
                    self.clickDownload(row.name);
                  }}><FaFileDownload /></span>
                </td>
                <td>
                  <button className="btn btn-sm btn-default" onClick={(ev) => {
                    self.clickRemove(row.name);
                  }}>
                    <FaSkullCrossbones size={18} />
                  </button>
                  <button className="btn btn-sm btn-default" onClick={(ev) => {
                    self.clickFresh(row.name);
                  }}>
                    <FaSync size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Page show={show} align={"right"} now={page} step={10} total={total} callback={(n) => {
          setPage(n);
          self.fresh(n);
        }} />
      </Col>
    </Row>

  );
}
export default StorageINFT;