export default class WebotsSimulator {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    private async sendRequest(body: string, scenario: number): Promise<Response> {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return await fetch(`${this.url}/api/scenario${scenario}`, {
            headers,
            method: 'POST',
            body,
        });
    }

    async pickOrder(orderId: string, boxColour: BoxColor) {
        await this.sendRequest(JSON.stringify({ orderId, boxColour }), 1);
    }

    async packOrder(orderId: string) {
        await this.sendRequest(JSON.stringify({ orderId }), 2);
    }

    async deliverOrder(orderId: string) {
        await this.sendRequest(JSON.stringify({ orderId }), 3);
    }
}
