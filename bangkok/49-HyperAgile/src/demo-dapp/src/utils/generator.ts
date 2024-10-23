import { createHash } from 'crypto';

import { names, phones, addresses } from '@/data/randomValues';

export const generateOrderId = (address: string): string => {
    const hash = createHash('sha256')
        .update(address + Date.now())
        .digest('hex');
    return hash.slice(2, 8);
};

export const generateRandomValue = (id: string): string => {
    if (id == 'name') return names[Math.floor(Math.random() * names.length)];
    if (id == 'phone') return phones[Math.floor(Math.random() * phones.length)];
    return addresses[Math.floor(Math.random() * addresses.length)];
};
