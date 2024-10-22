'use client';

import Image from 'next/image';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import './warning.css';

export default function Warning({ order }: { order: Order | undefined }) {
    const router = useRouter();
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        setIsCompleted(order?.status == 'completed');
    }, [order]);

    return (
        <div className='warning'>
            <Image
                className='logo'
                src={'/images/svg/logo.svg'}
                alt='logo'
                width={66}
                height={54}
            />
            {isCompleted ? (
                <div className='shop' onClick={() => router.push('/home/store')}>
                    <Image src={'/images/svg/store.svg'} alt='store' width={24} height={24} />
                </div>
            ) : (
                <div className='message'>
                    <Image src={'/images/svg/important.svg'} alt='warning' width={20} height={20} />
                    <h5>
                        Do not leave this page while your order is processing. <br /> Redirect will
                        be available here once completed.
                    </h5>
                </div>
            )}
        </div>
    );
}
