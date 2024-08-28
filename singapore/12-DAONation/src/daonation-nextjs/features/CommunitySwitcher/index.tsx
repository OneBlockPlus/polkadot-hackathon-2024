import { Dropdown, MenuItem } from '@heathmont/moon-core-tw';
import { Dao } from '../../data-model/dao';
import { useEffect, useState } from 'react';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import { JOINED } from '../../data-model/joined';
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';

const CommunitySwitcher = ({ title, daoId }: { title: string; daoId: Number }) => {
  const { api, GetAllDaos, GetAllJoined } = usePolkadotContext();
  const [list, setList] = useState([]);

  useEffect(() => {
    fetchContractData();
  }, [api]);

  async function fetchContractData() {
    try {
      if (api) {
        let allDaos = (await GetAllDaos()) as any as Dao[];
        let allJoined = (await GetAllJoined()) as any as JOINED[];

        const arrList = [];

        allJoined.forEach((joined_dao) => {
          let foundDao = (allDaos as any).filter((e) => e?.daoId == joined_dao.daoId.toString());
          if (joined_dao.user_id.toString() == (window as any).userid.toString() && foundDao.length > 0) {
            arrList.push(foundDao[0]);
          }
        });

        setList(arrList.reverse());
      }
    } catch (error) {}
  }

  function goToCommunity(community: Dao) {
    if (daoId !== community.daoId) {
      window.location.href = `/daos/${community.daoId}`;
    }
  }

  function isSelected(community: Dao): string {
    return daoId === community.daoId ? 'font-semibold' : null;
  }

  return (
    <Dropdown value={null} onChange={null} disabled={!(title && list.length > 1)}>
      <Dropdown.Trigger className="flex items-center gap-1">
        <h1 className="text-moon-32 font-bold">{title}</h1>
        {title && list.length > 1 && <ControlsChevronDown className="text-piccolo" fontSize={32} />}
      </Dropdown.Trigger>

      <Dropdown.Options className="bg-gohan w-80 truncate">
        {list.map((community, index) => (
          <Dropdown.Option key={index}>
            <MenuItem onClick={() => goToCommunity(community)} className={isSelected(community)}>
              {community.Title}
            </MenuItem>
          </Dropdown.Option>
        ))}
      </Dropdown.Options>
    </Dropdown>
  );
};

export default CommunitySwitcher;
