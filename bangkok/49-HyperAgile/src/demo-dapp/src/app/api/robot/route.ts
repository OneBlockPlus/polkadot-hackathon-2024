import { NextRequest, NextResponse } from 'next/server';

import Contracts from '@/class/HyperAgileContracts';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.orderId) throw new Error('No order id was provided');
        if (!body.robotId) throw new Error('No robot id was provided');

        if (body.robotId == 1) await Contracts.pickOrder(body.orderId);

        if (body.robotId == 2) await Contracts.packOrder(body.orderId);

        if (body.robotId == 3) await Contracts.deliverOrder(body.orderId);

        return NextResponse.json({}, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
