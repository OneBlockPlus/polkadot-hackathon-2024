import { AlertContainerFactory } from '@gear-js/react-hooks';
import { HexString } from '@polkadot/util/types';

import { Entries } from './types';

const cx = (...args: unknown[]) =>
  args
    .filter((arg) => typeof arg === 'string')
    .join(' ')
    .trim();

const getTypedEntries = <T extends object>(value: T) => Object.entries(value) as Entries<T>;

export { cx, getTypedEntries };

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Set value in seconds
export const sleep = (s: number) => new Promise((resolve) => setTimeout(resolve, s * 1000));

export const copyToClipboard = async ({
  alert,
  value,
  successfulText,
}: {
  alert?: AlertContainerFactory;
  value: string;
  successfulText?: string;
}) => {
  const onSuccess = () => {
    if (alert) {
      alert.success(successfulText || 'Copied');
    }
  };
  const onError = () => {
    if (alert) {
      alert.error('Copy error');
    }
  };

  function unsecuredCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
      onError();
    }
    document.body.removeChild(textArea);
  }

  if (window.isSecureContext && navigator.clipboard) {
    navigator.clipboard
      .writeText(value)
      .then(() => onSuccess())
      .catch(() => onError());
  } else {
    unsecuredCopyToClipboard(value);
  }
};

export function prettyDate(
  input: number | Date | string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'long',
    timeStyle: 'short',
    hourCycle: 'h23',
  },
  locale: string = 'en-US',
) {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function trimEndSlash(url: string): string {
  return url?.endsWith('/') ? url.slice(0, -1) : url;
}

export const prettyAddress = (address: HexString) => {
  return address.slice(0, 6) + '...' + address.slice(-4);
};

export const withoutCommas = (value: string): string => value.replace(/,/g, '');

export function toNumber(value: string) {
  return +withoutCommas(value);
}

export const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent,
);

export function base64ToUint8Array(base64: string) {
  const raw = window.atob(base64);
  const uint8Array = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) {
    uint8Array[i] = raw.charCodeAt(i);
  }
  return uint8Array;
}
