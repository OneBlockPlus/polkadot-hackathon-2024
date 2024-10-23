import { useEffect, useState } from 'react';
import * as Toast from '@radix-ui/react-toast';

import './toaster.css';

interface Props {
    order: Order | undefined;
}

const VRFToaster = ({ order }: Props) => {
    const [robot, setRobot] = useState('');
    const [status, setStatus] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!order || order.status == 'completed') return;

        if (order.hashes.length > 1 && order.hashes.length % 2 != 0) setOpen(true);
        setStatus(order.hashes.length % 2 == 0);
        if (order.hashes.length > 6) setRobot('Delivery');
        else if (order.hashes.length > 4) setRobot('Packing');
        else setRobot('Picking');
    }, [order?.hashes.length]);

    useEffect(() => {
        if (status) setTimeout(() => setOpen(false), 5000);
    }, [status]);

    return (
        <Toast.Provider swipeDirection='right' duration={120_000}>
            <Toast.Root className='ToastRoot' open={open} onOpenChange={setOpen}>
                {!status && <div id='spinner'></div>}
                <Toast.Title className='ToastTitle'>
                    {!status
                        ? `Assigning ${robot} Robot`
                        : `${robot} Robot
                assigned successfully!`}
                </Toast.Title>
                {!status && (
                    <Toast.Description asChild>
                        <p>
                            Please be patient as Moonbeam Randomness Precompile takes around 1
                            minute to process.
                        </p>
                    </Toast.Description>
                )}
            </Toast.Root>
            <Toast.Viewport className='ToastViewport' />
        </Toast.Provider>
    );
};

export default VRFToaster;
