import { Button } from '@heathmont/moon-core-tw';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Welcome() {
  return (
    <>
      <Head>
        <title>DAOnation</title>
        <meta name="description" content="DAOnation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-roshi w-full pb-16 md:min-h-full-min-header flex flex-col items-center gap-8 px-4">
        <div className="flex flex-col gap-4 items-center text-gohan mt-16 max-w-[900px] text-center">
          <h2 className="font-bold text-moon-48">Maximize charity impact through AI-driven decentralization</h2>
          <h5>Empower your charity's mission with DAOs, custom pages, community goals, and crypto-NFT events. Unlock the unparalleled value of decentralized giving.</h5>
        </div>
        <Link href="/register">
          <Button className="shadow-moon-md bg-dodoria">Get started</Button>
        </Link>
        <Image src="/home/charity-example.png" height={500} width={900} alt="" />
      </div>
      <div className="bg-gohan flex flex-col gap-20 text-brief py-16">
        <div className="flex homepage-container flex-col-reverse items-center md:flex-row md:gap-16 md:items-start">
          <div className="flex flex-col gap-8 pt-10">
            <h3 className="text-moon-32 font-bold">Decentralized empowerment with DAOs</h3>
            <p>Elevate your charity's mission with decentralized governance! Engage your team, make collective decisions, and keep transparency at the heart of your operations.</p>
          </div>
          <Image className="shrink-0" src="/home/decentralized.png" alt="" width={360} height={336} />
        </div>
        <div className="flex homepage-container flex-col items-center md:flex-row md:gap-16 md:items-start">
          <Image className="shrink-0" src="/home/craft.png" alt="" width={380} height={424} />
          <div className="flex flex-col gap-8 pt-10">
            <h3 className="text-moon-32 font-bold">AI-generate your charity's identity</h3>
            <p>Design a page that reflects your charity's essence and impact. Tailor it to your style, captivate donors, and showcase your unique story with finesse.</p>
          </div>
        </div>
      </div>
      <div className="bg-roshi flex flex-col gap-20 text-gohan py-16">
        <div className="flex homepage-container flex-col-reverse items-center md:flex-row md:gap-16 md:items-start">
          <div className="flex flex-col gap-8 pt-10">
            <h3 className="text-moon-32 font-bold">Community-driven charity goals</h3>
            <p>Design a page that reflects your charity's essence and impact. Tailor it to your style, captivate donors, and showcase your unique story with finesse.</p>
          </div>
          <Image className="shrink-0" src="/home/community-driven.png" alt="" width={380} height={200} />
        </div>
        <div className="flex homepage-container flex-col items-center md:flex-row md:gap-16 md:items-start">
          <Image className="shrink-0" src="/home/fundraising.png" alt="" width={380} height={350} />
          <div className="flex flex-col gap-8 pt-10">
            <h3 className="text-moon-32 font-bold">Embrace crypto and NFTs for fundraising</h3>
            <p>Dive into the world of crypto and NFTs to amplify your fundraising efforts! Accept crypto donations and host captivating NFT auctions to propel your charity's mission forward.</p>
          </div>
        </div>
      </div>
      <div className="bg-brief flex flex-col gap-20 text-gohan py-16">
        <div className="flex homepage-container flex-col-reverse items-center md:flex-row md:gap-16 md:items-start">
          <Image className="shrink-0" src="/home/livestream.png" alt="" width={420} height={360} />
          <div className="flex flex-col gap-8 pt-10">
            <h3 className="text-moon-32 font-bold">Sell tickets for live-stream events to raise even more</h3>
            <p>Schedule and host your own live-stream events, let others buy tickets to them, and fundraise even more money for your charity.</p>
          </div>
        </div>

        <div className="flex homepage-container flex-col items-center md:flex-row md:gap-16 md:items-start">
          <div className="flex flex-col gap-8 pt-10">
            <h3 className="text-moon-32 font-bold">Transparent funds, lasting impact</h3>
            <p>Witness the power of transparency! Track your funds seamlessly as they fuel your charity's endeavors. Every donation, every decision, making a measurable difference where it counts.</p>
          </div>
          <Image className="shrink-0" src="/home/transparent.png" alt="" width={420} height={360} />
        </div>
      </div>
    </>
  );
}
