import Browser from "webextension-polyfill";
import numbro from "numbro";
import { formatUnits, parseUnits } from "viem";

export const MAIN_UI_URL = Browser.runtime.getURL("index.html");

export function openInNewTab() {
  return Browser.tabs.create({ url: MAIN_UI_URL });
}

export function openWelcomeInNewTab() {
  return Browser.tabs.create({ url: `${MAIN_UI_URL}#/welcome?type=webpage` });
}

export function isValidUrl(url: string | null) {
  if (!url) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch (e: unknown) {
    return false;
  }
}

export function prepareLinkToCompare(link: string) {
  let adjLink = link.toLowerCase();
  if (!adjLink.endsWith("/")) {
    adjLink += "/";
  }
  return adjLink;
}

/**
 * Includes ? when query string is set
 */
export function toSearchQueryString(searchParams: URLSearchParams) {
  const searchQuery = searchParams.toString();
  if (searchQuery) {
    return `?${searchQuery}`;
  }
  return "";
}

export function formatBalance(
  value: bigint | string | number | undefined | null,
  options: any = {}
) {
  if (value === undefined || value === null) return;
  if (typeof value === "bigint") {
    value = formatUnits(value, 12);
  }
  return numbro(value).format({
    thousandSeparated: true,
    mantissa: 2,
    ...options,
  });
}

export function getUSD(
  value: bigint | string | undefined | null,
  // DOT price
  price = 4.38
) {
  if (value === undefined || value === null) return;
  if (typeof value === "bigint") {
    value = formatUnits(value, 12);
  }
  return Number(value) * price;
}
