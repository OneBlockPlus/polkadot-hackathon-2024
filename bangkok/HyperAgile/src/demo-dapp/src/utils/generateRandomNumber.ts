export async function generateRobotId(orderId: string, robotId: 0 | 1 | 2) {
    await fetch('/api/order/random-number', {
        method: 'POST',
        body: JSON.stringify({ orderId, robotId }),
    });
}
