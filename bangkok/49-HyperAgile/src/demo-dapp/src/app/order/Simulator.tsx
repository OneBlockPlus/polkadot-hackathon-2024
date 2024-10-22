'use client';

import Image from 'next/image';

import { useEffect, useMemo } from 'react';

import './simulator.css';

interface Props {
    simulationMethod: string;
    simulationStatus: SimulatorStatus;
    productName: string;
    setDesign: React.Dispatch<React.SetStateAction<boolean>>;
    order: Order | undefined;
}

export default function Simulator({
    simulationMethod,
    simulationStatus,
    productName,
    setDesign,
    order,
}: Props) {
    const completed = (
        <>
            <Image id='logo' src={'/images/simulator.png'} alt='simulator' height={96} width={96} />
            <h4>Simulation Completed</h4>
            <Image src={'/images/svg/marked.svg'} alt='marked' height={36} width={36} />
        </>
    );

    const processing = (
        <>
            <Image id='logo' src={'/images/simulator.png'} alt='simulator' height={96} width={96} />
            <h4>Waiting for next command</h4>
            <div id='spinner'></div>
        </>
    );

    useEffect(() => {
        if (!simulationMethod) return;
    }, [simulationMethod]);

    return (
        <section className='simulator'>
            <div id='header'>
                <h4>HyperAgile Simulator</h4>
                <div id='order-prop'>
                    <Image src={'/images/svg/power.svg'} alt='power' height={9} width={9} />
                    <h6>Webots Simulator</h6>
                </div>
                <Image
                    src={'/images/svg/info.svg'}
                    alt='info'
                    width={19}
                    height={19}
                    onMouseEnter={() => setDesign(true)}
                    onMouseLeave={() => setDesign(false)}
                />
            </div>
            <div className='simulation'>
                {useMemo(
                    () =>
                        simulationStatus == 'processing' ? (
                            <>{processing}</>
                        ) : simulationMethod == 'local' && simulationStatus != 'completed' ? (
                            <>{processing}</>
                        ) : simulationStatus == 'completed' ? (
                            <>{completed}</>
                        ) : (
                            <video width={'auto'} height={'100%'} autoPlay disablePictureInPicture>
                                <source
                                    src={`/videos/${simulationStatus}${
                                        simulationStatus != 'delivery'
                                            ? `-${productName[productName.length - 1]}`
                                            : ''
                                    }.mp4`}
                                    type='video/mp4'
                                />
                                Your browser does not support the video tag.
                            </video>
                        ),
                    [simulationStatus, simulationMethod, order?.hashes.length]
                )}
            </div>
        </section>
    );
}
