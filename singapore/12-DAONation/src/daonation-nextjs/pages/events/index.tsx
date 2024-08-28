import Head from 'next/head';
import EventCard from '../../components/components/EventCard';
import { CharityEvent } from '../../data-model/event';

export default function Events() {
  return (
    <>
      <Head>
        <title>DAOnation - Events</title>
        <meta name="description" content="DAOnation - Events" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center flex-col gap-8">
        <div className="gap-8 flex flex-col w-full bg-gohan pt-10 pb-6 border-beerus border">
          <div className="container flex w-full justify-between">
            <div className="flex flex-col gap-1 overflow-hidden text-center w-full">
              <h1 className="text-moon-32 font-bold">All events</h1>
              <h3 className="text-trunks">Here you can find all ongoing charity events</h3>
            </div>
          </div>
        </div>
        <div className="container flex flex-col gap-8 items-center">
          {/* {mockEvents.map((event, index) => (
            <EventCard item={event} key={index} />
          ))} */}
        </div>
      </div>
    </>
  );
}
