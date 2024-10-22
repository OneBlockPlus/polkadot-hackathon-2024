import { Button, Footer } from "flowbite-react";
import TicketCard, { ITicketCard } from "../components/TicketCard";
import Typography from "../components/Typography";
import { FiSearch } from "react-icons/fi";

const ITEMS: Array<ITicketCard> = [
  {
    date: new Date().toISOString(),
    location: "Viet Nam",
    ticketType: "Film",
    title: "Card title",
  },
  {
    date: new Date().toISOString(),
    location: "Viet Nam",
    ticketType: "Film",
    title: "Card title",
  },
  {
    date: new Date().toISOString(),
    location: "Viet Nam",
    ticketType: "Film",
    title: "Card title",
  },
  {
    date: new Date().toISOString(),
    location: "Viet Nam",
    ticketType: "Ticket Type",
    title: "Card title",
  },
];

const SearchPage = () => {
  return (
    <main className="min-h-main mb-20">
      <section className="mt-12 flex flex-col">
        <div className="flex items-center justify-between">
          <Typography component="h1" className="text-header font-bold">
            Find tickets
          </Typography>
          <div className="flex flex-col">
            <Typography
              component="p"
              className="text-text-secondary-color"
              style={{
                fontSize: "1.25rem",
              }}
            >
              Filters
            </Typography>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between">
          <Typography component="label" className="text-normal">
            6{" "}
            <span className="text-normal text-text-secondary-color">
              results found
            </span>
          </Typography>
          <Button
            color="bookadot-primary"
            className="flex items-center hover:opacity-80 [&_span]:items-center"
          >
            <FiSearch className="mr-2 size-[16px] [&_*]:text-black" />
            Search again
          </Button>
        </div>
      </section>

      <Footer.Divider className="my-2"></Footer.Divider>

      <section className="grid grid-cols-12 gap-4">
        {ITEMS.map((item, index) => (
          <div className="col-span-4" key={`ticket_${index}`}>
            <TicketCard {...item} />
          </div>
        ))}
      </section>
    </main>
  );
};

export default SearchPage;
