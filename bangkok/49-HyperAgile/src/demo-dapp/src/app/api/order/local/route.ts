import { NextRequest, NextResponse } from 'next/server';

import WebotsSimulator from '@/class/WebotsSimulator';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.orderId) throw new Error('No order was provided');
        if (!body.stage) throw new Error('No stage was provided');
        if (body.stage == 1 && !body.productNameId) throw new Error('No color was provided');
        if (!body.url) throw new Error('No url was provided');

        const simulator = new WebotsSimulator(body.url);

        if (body.stage == 1)
            await simulator.pickOrder(
                body.orderId,
                body.productNameId == 1 ? 'green' : body.productNameId == '2' ? 'purple' : 'blue'
            );
        if (body.stage == 2) await simulator.packOrder(body.orderId);
        if (body.stage == 3) await simulator.deliverOrder(body.orderId);

        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
    }
}
