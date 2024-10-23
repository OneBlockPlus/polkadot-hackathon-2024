import { IconButton, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose } from '@heathmont/moon-icons-tw';
import { useEffect, useMemo } from 'react';
import { NFT } from '../../data-model/nft';
import useEnvironment from '../../contexts/EnvironmentContext';
import { Table } from '@heathmont/moon-table-tw';
import HeaderLabel from '../../components/components/HeaderLabel';

export default function BidHistoryModal({ open, onClose, item }: { open: boolean; onClose: () => void; item: NFT }) {
  const { getCurrency } = useEnvironment();

  const columnsInitial = [
    {
      Header: <HeaderLabel>Date</HeaderLabel>,
      accessor: 'date'
    },
    {
      Header: <HeaderLabel>Wallet Address</HeaderLabel>,
      accessor: 'walletAddress'
    },
    {
      Header: <HeaderLabel>Bidder</HeaderLabel>,
      accessor: 'bidder'
    },
    {
      Header: <HeaderLabel>Bid amount</HeaderLabel>,
      accessor: 'bidAmount'
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

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="min-w-[760px] bg-gohan">
        <div className="flex items-center justify-center flex-col">
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">View bids on {item?.name}</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
          <div className="flex flex-col gap-6 w-full p-6 max-h-[calc(90vh-162px)]">{item && item.bidHistory && <Table data={ item.bidHistory} defaultColumn={defaultColumn} columns={columns} />}</div>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
