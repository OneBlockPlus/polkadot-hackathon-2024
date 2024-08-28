import { Table } from '@heathmont/moon-table-tw';
import { useMemo } from 'react';
import useEnvironment from '../../contexts/EnvironmentContext';
import HeaderLabel from '../../components/components/HeaderLabel';

const TransactionsPanel = () => {
  const { getCurrency } = useEnvironment();

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

  const mockData = [
    {
      description: (
        <span>
          Monthly subscription for "
          <a className="text-piccolo" href="/daos/m_0">
            DAO
          </a>
          "
        </span>
      ),
      date: '22 Nov 2025 06:05 PM',
      subscriptionAmount: `${getCurrency()} 2.40 `
    },
    {
      description: (
        <span>
          Monthly subscription for "
          <a className="text-piccolo" href="/daos/m_0">
            Concious Nona
          </a>
          "
        </span>
      ),
      date: '22 Nov 2025 06:05 PM',
      subscriptionAmount: `${getCurrency()} 40.4`
    }
  ];

  return <Table columns={columns} rowSize="xl" data={mockData} isSorting={true} defaultColumn={defaultColumn} width={800} defaultRowBackgroundColor="white" evenRowBackgroundColor="white" headerBackgroundColor="trunks" />;
};

export default TransactionsPanel;
