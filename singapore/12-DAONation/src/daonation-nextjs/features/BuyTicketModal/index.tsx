import { Button, IconButton, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose, GenericCheckAlternative } from '@heathmont/moon-icons-tw';

export default function BuyTicketModal({ open, onClose, event }: { open: boolean; onClose: () => void; event }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="min-w-[480px] bg-gohan">
        <div className="flex items-center justify-center flex-col">
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Ticket confirmation</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full p-6 items-center">
          <div className="h-24 w-24 rounded-full bg-piccolo flex items-center justify-center">
            <GenericCheckAlternative className="text-moon-48 text-gohan" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-moon-24 text-center">You have a ticket!</h3>
            <p className="text-trunks text-center">
              The stream of the {event?.Title} will start on <br />
              <strong>
                {event?.TimeFormat}, {event?.End_Date}
              </strong>
            </p>
          </div>
        </div>
        <div className="flex justify-end border-t border-beerus w-full p-6">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal.Panel>
    </Modal>
  );
}
