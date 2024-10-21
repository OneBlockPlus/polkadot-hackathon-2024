import { NextRequest, NextResponse } from 'next/server';

import Contracts from '@/class/HyperAgileContracts';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.orderId) throw new Error('No orderId was provided');
        if (body.robotId == undefined) throw new Error('No robotId was provided');

        const requestId = await Contracts.sendRequest(body.orderId, body.robotId);
        await Contracts.fulfillRequest(requestId);

        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
