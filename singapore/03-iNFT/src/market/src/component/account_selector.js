import { useEffect, useState } from "react";

import Account from "../system/account";

function AccountSelector(props) {
  const size = {
    row: [12],
  };

  let [list, setList] = useState([]);

  const self = {
    fresh: () => {
      Account.list({}, (data) => {
        //console.log(data);
        setList(data);
        if(props.callback && data && data[0]) props.callback(data[0].address);
      });
    },
  }

  useEffect(() => {
    self.fresh();
  }, [props.update]);

  return (
    <select disabled={props.disable} className="form-control" onChange={(ev)=>{
      if(props.callback) props.callback(ev.target.value);
    }}>
      {list.map((row, index) => (
        <option key={index} value={row.address}>{row.address}</option>
      ))}
    </select>
  );
}
export default AccountSelector;