import { Table } from "react-bootstrap";
import { useEffect, useState } from "react";

import { FaLightbulb, FaSkullCrossbones, FaSync } from "react-icons/fa";

import tools from "../lib/tools";
import Config from "../system/config";
import Status from "../system/status";

function ProxyMarket(props) {
  const size = {
    row: [12],
    head: [4, 8],
    normal: [9, 3],
    left: [8, 4],
    right: [4, 8],
  };

  let [list, setList] = useState([]);
  let [status, setStatus] = useState({});

  const self = {
    
    getColor: (code) => {
      //console.log(code);
      let color = "grey";
      switch (code) {
        case undefined:
          break;

        case 1:
          color = "green";
          break;
        case 2:
          color = "yellow";
          break;
        case 4:
          color = "red";
          break;
        case 9:             //unknow
          //color = "red";
          break;
        case 13:
          color = "red";
          break;
        default:
          break;
      }
      return color
    },
    updateStatus: (urls) => {
      console.log(urls);
      const st = Status.get(urls);
      setStatus(tools.clone(st));
    },
    fresh: () => {
      const arr = Config.get(["proxy","nodes","market"]);
      setList(arr);

      const urls=[];
      for(let i=0;i<arr.length;i++){
        const row=arr[i];
        urls.push(`${row.protocol}${row.domain}`);
      }
      self.updateStatus(urls);
    },
  }

  useEffect(() => {
    self.fresh();
  }, []);

  return (
    <Table striped bordered hover>
          <thead>
            <tr>
              <th>Domain</th>
              <th>Language</th>
              <th>Deifinition</th>
              <th>Orgin</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row, index) => (
              <tr key={index}>
                <td>
                  <span><FaLightbulb color={self.getColor(status[`${row.protocol}${row.domain}`])} /></span>
                  <span className="ml-5">{row.protocol}{row.domain}</span>
                </td>
                <td>{row.lang}</td>
                <td>{row.def}</td>
                <td>{row.orgin}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </Table>
  );
}
export default ProxyMarket;