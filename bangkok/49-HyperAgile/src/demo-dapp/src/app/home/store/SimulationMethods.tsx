'use client';

import Image from 'next/image';

import { useRouter } from 'next/navigation';
import React, { useMemo, useRef, useState } from 'react';

import './simulation-method.css';

export default function SimulationMethods({ orderId }: { orderId: string }) {
    const router = useRouter();

    const [isLocal, setIsLocal] = useState(false);
    const passcode = useRef('');
    const url = useRef('');

    return (
        <>
            {useMemo(
                () =>
                    isLocal ? (
                        <section className='local-simulation'>
                            <Image
                                src={'/icons/cross.svg'}
                                alt='cross'
                                width={16}
                                height={16}
                                onClick={() => setIsLocal(false)}
                            />
                            <h1>Connect to local Webots simulation</h1>
                            <h5>
                                This option only available for the owner of this web application for
                                demonstration purpose . If you are a normal user of this web
                                application, either contact the owner or kindly proceed for an
                                online simulation.
                            </h5>
                            <div>
                                <label htmlFor='passcode'>Passcode</label>
                                <input
                                    type='text'
                                    onChange={(event) => (passcode.current = event.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor='url'>Ngrok URL</label>
                                <input
                                    type='text'
                                    onChange={(event) => (url.current = event.target.value)}
                                />
                            </div>
                            <button
                                id='black-button'
                                onClick={() => {
                                    if (passcode.current != 'admin318') {
                                        alert!('Wrong Password!');
                                        return;
                                    }
                                    router.push(
                                        `/order?id=${orderId}&method=local&url=${url.current}`
                                    );
                                }}
                            >
                                Establish connection
                            </button>
                        </section>
                    ) : (
                        <section className='simulation-method'>
                            <div className='logo'>
                                <Image
                                    src={'/images/simulator.png'}
                                    alt='webots'
                                    width={50}
                                    height={50}
                                />
                                <Image
                                    src={'/images/webots.png'}
                                    alt='webots'
                                    width={150}
                                    height={50}
                                />
                            </div>
                            <div className='container'>
                                <h1>Choose a simulation method</h1>
                                <Method
                                    name='Online Simulation'
                                    description="Simulate Aptotics' warehouse activities via Webots pre-recorded simulation stream."
                                    handler={() =>
                                        router.push(`/order?id=${orderId}&method=online`)
                                    }
                                />
                                <Method
                                    name='Online + Local Simulation'
                                    description="Simulate Aptotics' warehouse activities via Webots pre-recorded simulation stream as well as in sync with a local Webots World."
                                    handler={() => setIsLocal(true)}
                                />
                            </div>
                        </section>
                    ),
                [isLocal]
            )}
        </>
    );
}

interface Props {
    name: string;
    description: string;
    handler: () => void;
}

function Method({ name, description, handler }: Props) {
    return (
        <div className='method'>
            <Image src={'/images/simulator.png'} alt='webots' width={50} height={50} />
            <h2>{name}</h2>
            <h6>{description}</h6>
            <button id='black-button' onClick={handler}>
                Start Simulation
            </button>
        </div>
    );
}
