// "use client";

import { Chart, CheckedTicket, Global, Road } from "../components/Icon";
import Typography from "../components/Typography";
import AboutItem from "./components/AboutItem";

function About() {
  return (
    <section className="flex flex-col items-center">
      <div className="my-20 flex w-[82.55%] flex-col">
        <div className="flex w-full flex-col items-center">
          <Typography component="label" className="text-header">
            So
            <span className="mx-2 text-accent-color">who</span>
            are we exactly?
          </Typography>
          <Road className="mt-8" />
        </div>

        <section className="mt-16 flex flex-col gap-32">
          <AboutItem icon={<CheckedTicket />} direction="left">
            <Typography
              component="label"
              className="text-[1.25rem] font-medium leading-8 text-text-secondary-color"
            >
              TicketBooker is an online platform for{" "}
              <span>purchasing tickets</span> to concerts, movies or flights
              internationally. Our services make it easy to book tickets from
              several booking websites and make them available in one place, in
              a <span className="!mx-0">single transaction</span>, whether you
              are in the UK, the USA or Europe. <span>No fees</span> are charged
              at the point of purchase or after your event has ended.
            </Typography>
          </AboutItem>

          <AboutItem icon={<Global />} direction="right">
            <Typography
              component="label"
              className="text-[1.25rem] font-medium leading-8 text-text-secondary-color"
            >
              TicketBooker operates in all{" "}
              <span>EU countries, Iceland, Norway and Switzerland.</span> The
              founding team of TicketBooker was made up of entrepreneurs from
              London, Oslo and Paris. The company now employs{" "}
              <span>120 people</span>. The service’s technical platform has a
              back-end computer server with support of Citrix/Dell shared
              network servers and database.
            </Typography>
          </AboutItem>
          <AboutItem icon={<Chart />} direction="left">
            <Typography
              component="label"
              className="text-[1.25rem] font-medium leading-8 text-text-secondary-color"
            >
              In September 2015, TicketBooker partnered with{" "}
              <span>Worldline</span>, one of Europe’s leading provider of
              payment services, for TicketBooker’s European ticket booking
              services, allowing the company to <span>expand its presence</span>{" "}
              to 2,500+ Live Nation & AXS corporate clients as well as 20,000+
              independent music venues and promoters. TicketBooker has received{" "}
              <span>$1.3m</span> in funding from City Index Ventures in May
              2014.
            </Typography>
          </AboutItem>
        </section>
      </div>
    </section>
  );
}

export default About;
