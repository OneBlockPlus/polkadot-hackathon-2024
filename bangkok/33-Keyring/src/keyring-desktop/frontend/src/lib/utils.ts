import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TRUNCATED_ADDRESS_END_CHARS, TRUNCATED_ADDRESS_START_CHARS, TRUNCATED_NAME_CHAR_LIMIT } from "./labels";
import { toast } from "@/components/ui/use-toast";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string) {
  if (address.length < TRUNCATED_NAME_CHAR_LIMIT) {
    return address;
  }

  return `${address.slice(0, TRUNCATED_ADDRESS_START_CHARS)}...${address.slice(
    -TRUNCATED_ADDRESS_END_CHARS,
  )}`;
}

export function errToast(err: any) {
  toast({
    title: "Uh oh! Something went wrong.",
    description: `Error happens: ${err}`,
  });
}

export function showTime(unixTimestamp: number) {
  const currentTime = new Date();
  const timestamp = new Date(unixTimestamp * 1000); // Convert Unix timestamp to milliseconds

  const difference = currentTime.getTime() - timestamp.getTime();
  const minutes = Math.floor(difference / 60000); // Convert milliseconds to minutes

  if (minutes < 1) {
      return 'Just now';
  } else if (minutes === 1) {
      return '1 minute ago';
  } else if (minutes < 60) {
      return `${minutes} minutes ago`;
  } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}

export interface RemoteRequestTime {
  [key: string]: number;
}
