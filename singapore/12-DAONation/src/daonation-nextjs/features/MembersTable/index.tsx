import { Tooltip } from '@heathmont/moon-core-tw';
import { GenericInfo } from '@heathmont/moon-icons-tw';
import { Table } from '@heathmont/moon-table-tw';
import { useEffect, useMemo, useState } from 'react';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import HeaderLabel from '../../components/components/HeaderLabel';

const MembersTable = ({ allJoined, goals }) => {
  const { api, GetAllDonations, GetAllIdeas, GetAllVotes, getUserInfoById } = usePolkadotContext();
  const [Data, setData] = useState([]);

  const columnsInitial = [
    {
      Header: <HeaderLabel>Name</HeaderLabel>,
      accessor: 'name'
    },
    {
      Header: <HeaderLabel>Join date</HeaderLabel>,
      accessor: 'joinDate'
    },
    {
      Header: (
        <HeaderLabel>
          Vote power level
          <Tooltip>
            <Tooltip.Trigger>
              <div className="">
                <GenericInfo className="ml-1" fontSize={16} />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content className="bg-gohan">
              This level is based on amount of received donations, votes, and comments within this charity.
              <Tooltip.Arrow className="bg-gohan" />
            </Tooltip.Content>
          </Tooltip>
        </HeaderLabel>
      ),
      accessor: 'votePower'
    },
    {
      Header: <HeaderLabel>Votes received</HeaderLabel>,
      accessor: 'votesReceived',
      width: 100
    },
    {
      Header: <HeaderLabel>Comments received</HeaderLabel>,
      accessor: 'commentsReceived',
      width: 100
    },
    {
      Header: <HeaderLabel>Donations received</HeaderLabel>,
      accessor: 'donationsReceived',
      width: 100
    }
  ];

  const defaultColumn = useMemo(
    () => ({
      minWidth: 100,
      maxWidth: 300
    }),
    []
  );

  const columns = useMemo(() => columnsInitial, []);

  async function loadData() {
    let Members = [];
    let allIdeas = await GetAllIdeas();
    for (let i = 0; i < allJoined.length; i++) {
      const element = allJoined[i];
      let userInfo = await getUserInfoById(Number(element.user_id));
      let allIdeasIds = allIdeas.map((e) => Number(e.user_id) == Number(element.user_id));

      let allDonations = await GetAllDonations();
      let totalAmount = 0;
      let donations = allDonations.filter((e) => allIdeasIds.indexOf(e.ideasId) != -1);
      donations.forEach((e) => (totalAmount += e.donation));
      let allVotes = await GetAllVotes();
      let votes = allVotes.filter((e) => allIdeasIds.indexOf(e.ideasId) != -1);

      let UserCreatedGoals = goals.filter((e) => Number(e.UserId) == Number(element.user_id));

      let totalVotes = 0;
      UserCreatedGoals.forEach((e) => (totalVotes += e.votesCount));

      let info = {
        name: userInfo?.fullName?.toString(),
        joinDate: element.joined_date,
        votePower: 1,
        votesReceived: votes.length,
        commentsReceived: 0,
        donationsReceived: donations.length,
        donated: totalAmount
      };

      Members.push(info);
    }

    console.log('members', Members);

    setData(Members);
  }

  useEffect(() => {
    if (api && allJoined.length > 0) {
      loadData();
    }
  }, [api, allJoined]);

  return (
    <>
      <Table columns={columns} rowSize="xl" data={Data} isSorting={true} defaultColumn={defaultColumn} width={800} defaultRowBackgroundColor="white" evenRowBackgroundColor="white" headerBackgroundColor="trunks" />
    </>
  );
};

export default MembersTable;
