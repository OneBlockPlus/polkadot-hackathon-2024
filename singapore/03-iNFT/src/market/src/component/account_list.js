import { Row, Col, Table, Form } from "react-bootstrap";
import { useEffect, useState } from "react";

import { FaCopy, FaFileDownload, FaSkullCrossbones, FaPaperPlane } from "react-icons/fa";

import Account from "../system/account";

import INDEXED from "../lib/indexed";
import Copy from "../lib/clipboard";
import tools from "../lib/tools";

import Config from "../system/config";

function AccountList(props) {
  const size = {
    row: [12],
    balance: [9, 3]
  };

  let [list, setList] = useState([]);
  let [balances, setBalances] = useState({});
  let [recover, setRecover] = useState({});

  const nameDB = Config.get(["storage", "DBname"]);
  const table = "accounts";

  const self = {
    clickRemove: (addr) => {
      INDEXED.checkDB(nameDB, (db) => {
        if (INDEXED.checkTable(db.objectStoreNames, table)) {
          INDEXED.removeRow(db, table, "address", addr, (done) => {
            if (done) self.fresh();
          });
        }
      });
    },
    clickCopy: (address) => {
      Copy(address);
    },
    callRecover: (key, at) => {
      if (!recover[key]) {
        recover[key] = "text-warning";
        setRecover(tools.copy(recover));
        setTimeout(() => {
          delete recover[key];
          setRecover(tools.copy(recover));
        }, !at ? 1000 : at);
      }
    },
    getDate: (stamp) => {
      const dt = new Date(stamp);
      return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
    },
    getBalances: (accs) => {
      const narr = [];
      for (let i = 0; i < accs.length; i++) {
        narr.push(accs[i].address);
      }

      Account.balance(narr, (bs) => {
        console.log(bs);
        setBalances(bs);
      });
    },
    fresh: () => {
      Account.list({}, (data) => {
        setList(data);
        setTimeout(() => {
          self.getBalances(data);
        }, 100);
      });
    },
  }

  useEffect(() => {
    self.fresh();
  }, [props.update]);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Network</th>
              <th>Address</th>
              <th>Balance</th>
              <th>Stamp</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row, index) => (
              <tr key={index}>
                <td>{tools.toUp(row.network)}</td>
                <td>
                  <button className="btn btn-sm btn-default" onClick={(ev) => {
                    self.clickCopy(row.address);
                    self.callRecover(row.address);
                  }}>
                    <FaCopy className={!recover[row.address] ? "" : recover[row.address]} size={18}/>
                  </button>
                  <span>{tools.shorten(row.address)}</span>
                </td>
                <td>
                  <Row>
                    <Col md={size.balance[0]} lg={size.balance[0]} xl={size.balance[0]} xxl={size.balance[0]}>
                      {!balances[row.address] ? 0 : balances[row.address]}
                    </Col>
                    <Col md={size.balance[1]} lg={size.balance[1]} xl={size.balance[1]} xxl={size.balance[1]}>
                      <button className="btn btn-sm btn-default">
                        <FaPaperPlane size={18}/>
                      </button>
                    </Col>
                  </Row>
                </td>
                <td>{self.getDate(row.stamp)}</td>
                <td>
                  <button className="btn btn-sm btn-default" onClick={(ev) => {
                    self.clickRemove(row.address);
                  }}>
                    <FaSkullCrossbones size={18}/>
                  </button>
                  <button className="btn btn-sm btn-default">
                    <FaFileDownload size={18}/>
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
export default AccountList;