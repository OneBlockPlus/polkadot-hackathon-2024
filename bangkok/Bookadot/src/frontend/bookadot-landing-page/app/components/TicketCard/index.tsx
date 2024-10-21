import { Button, Card, Footer } from "flowbite-react";
import Typography from "../Typography";
import { Calendar } from "../Icon";
import { PiMapPinFill } from "react-icons/pi";
import dayjs from "dayjs";

export interface ITicketCard {
  title: string;
  date: string;
  location: string;
  ticketType: string;
}

const TicketCard = ({ date, location, ticketType, title }: ITicketCard) => {
  return (
    <Card className="flex flex-col !bg-foreground-color p-4 [&>div]:p-0">
      <Typography component={"h2"} className="text-[1.375rem] font-semibold">
        {title}
      </Typography>
      <div className="flex flex-col">
        <div className="flex items-center">
          <Calendar />
          <div className="ml-2 flex flex-col">
            <Typography component="p" className="text-sub">
              Date
            </Typography>
            <Typography
              component="p"
              className="text-sub mt-1 text-text-secondary-color"
            >
              {dayjs(date).format("DD-MM-YYYY")}
            </Typography>
          </div>
        </div>

        <div className="mt-3 flex items-center">
          <PiMapPinFill className="size-[24px]" />
          <Typography component="p" className="text-sub ml-2">
            {location}
          </Typography>
        </div>
        <Footer.Divider className="mb-2 mt-4" />
        <div className="flex justify-between">
          <Typography component="p" className="text-sub text-accent-color">
            {ticketType}
          </Typography>
          <Button
            color="bookadot-primary"
            className="[&_span]:text-sub !rounded-[8px] p-[3px_15px] hover:opacity-80 [&_span]:p-0 [&_span]:font-medium [&_span]:text-white"
          >
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TicketCard;
