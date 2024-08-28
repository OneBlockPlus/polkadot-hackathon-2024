import { SiteConfig } from "@/types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "Relaycode",
  description:
    "Relaycode: Intuitive extrinsics builder for Polkadot ecosystem. Simplify complex pallet interactions with real-time encoding, wallet integration, and shareable snippets.",
  url: site_url,
  ogImage: `${site_url}/_static/og.jpg`,
  links: {
    twitter: "https://twitter.com/itsyogesh18",
    github: "https://github.com/itsyogesh",
  },
  mailSupport: "hello@itsyogesh.fyi",
};
