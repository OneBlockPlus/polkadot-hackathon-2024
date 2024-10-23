import { AvatarMap, myAddress, NameMap } from "./mock";
import { Avatar } from "@nextui-org/avatar";

export function createDepositRows(data: any) {
  return data.map((details: any) => {
    return {
      key: details[0],
      avatar: (
        <Avatar
          src={AvatarMap[details[0] as string]}
          name={NameMap[details[0] as string]}
          size="lg"
        />
      ),
      name: (
        <div className="">
          <span>{NameMap[details[0] as string]}</span>
        </div>
      ),
      amount: details[1],
      showButton: details[0] == myAddress,
    };
  });
}

export function createDefaulterTableData(data: any) {
  const rows = data.map((details: any) => {
    return {
      key: details[0],
      avatar: (
        <Avatar
          src={AvatarMap[details[0] as string]}
          name={NameMap[details[0] as string]}
          size="lg"
        />
      ),
      name: (
        <div className="">
          <span>{NameMap[details[0] as string]}</span>
        </div>
      ),
      defaultCount: details[1],
    };
  });

  return rows;
}
