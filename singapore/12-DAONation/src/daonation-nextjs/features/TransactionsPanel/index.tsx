import { Table } from '@heathmont/moon-table-tw';
import { useEffect, useMemo, useState } from 'react';
import useEnvironment from '../../contexts/EnvironmentContext';
import HeaderLabel from '../../components/components/HeaderLabel';

const TransactionsPanel = ({ transactions }) => {
  const { getCurrency } = useEnvironment();
  const [Data, setData] = useState([])

  const columnsInitial = [
    {
      Header: <HeaderLabel>Description</HeaderLabel>,
      accessor: 'description'
    },
    {
      Header: <HeaderLabel>Date</HeaderLabel>,
      accessor: 'date'
    },
    {
      Header: <HeaderLabel>Amount</HeaderLabel>,
      accessor: 'subscriptionAmount'
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

  function generateData() {
    let allData = [];
    for (let i = 0; i < transactions.length; i++) {
      const element = transactions[i];
      allData.push({
        description: (
          <span>
            {element.subTitle} "
            <a className="text-piccolo" href={element.url}>
              {element.Title}
            </a>
            "
          </span>
        ),
        date: element.date,
        subscriptionAmount: `${getCurrency()} ${element.Amount}`
      },)
    }
    setData(allData);
  }
  useEffect(() => {
    generateData()
  },[transactions])

  return <Table columns={columns} rowSize="xl" data={Data} isSorting={true} defaultColumn={defaultColumn} width={800} defaultRowBackgroundColor="white" evenRowBackgroundColor="white" headerBackgroundColor="trunks" />;
};

export default TransactionsPanel;
