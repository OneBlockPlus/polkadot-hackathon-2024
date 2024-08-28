export enum TxnStatus {
  pending = 'pending',
  confirm0 = 'confirm0',
  confirm1 = 'confirm1',
  done = 'done',
}

function renderStatus(status: TxnStatus) {
  switch (status) {
    case TxnStatus.pending:
      return Pending
    case TxnStatus.confirm0:
      return Done
    case TxnStatus.confirm1:
      return Confirm1
    case TxnStatus.done:
      break

    default:
      return Unknow
  }
}

export default function StatusCell({ status }: { status: string }) {
  return renderStatus(status as TxnStatus)
}

const Confirm0 = (
  <div className={'animate-pulse'}>
    <span className="inline-flex items-center gap-x-1.5 rounded-md bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800">
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className="h-1.5 w-1.5 fill-yellow-500">
        <circle r={3} cx={3} cy={3} />
      </svg>
      0/2 Confirm
    </span>
  </div>
)

const Confirm1 = (
  <div className={'animate-pulse'}>
    <span className="inline-flex items-center gap-x-1.5 rounded-md bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800">
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className="h-1.5 w-1.5 fill-yellow-500">
        <circle r={3} cx={3} cy={3} />
      </svg>
      1/2 Confirm
    </span>
  </div>
)

const Pending = (
  <span className="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
    <svg
      viewBox="0 0 6 6"
      aria-hidden="true"
      className="h-1.5 w-1.5 fill-green-500">
      <circle r={3} cx={3} cy={3} />
    </svg>
    Pending
  </span>
)

const Done = (
  <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
    Done
  </span>
)

const Unknow = (
  <span className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
    Unknown
  </span>
)
