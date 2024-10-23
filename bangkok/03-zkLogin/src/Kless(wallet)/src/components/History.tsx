import dayjs from "dayjs";

export const History = ({
  order,
  date,
  amount,
  currency,
  className,
}: {
  order: number;
  date: Date;
  amount: number;
  currency: string;
  className?: string;
}) => {
  return (
    <div
      className={`flex items-center justify-between py-3 border-b ${className}`}
    >
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-4 p-1">{order}</div>
        <div>
          <p className="text-sm font-medium leading-none">oxfddfd</p>
          <p className="text-xs text-gray-400 mt-1">{dayjs(date).format("YYYY-MM-DD HH:mm")}</p>
        </div>
      </div>
      <div>{amount} {currency}</div>
    </div>
  );
};
