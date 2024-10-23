import  axios from 'axios';
export class Client {
    private apiUrl = `http://localhost:91110`;
    async getBitcoinAddress(account: string) {
        try {
            const { data } = await axios.post(`${this.apiUrl}/bridge/request-address`, {
                account,
            });
            return data;
        } catch (e) {
            return {
                address: 'bc1q8lvlq3mez4ptymd5r36t66mnltcu2ezx4ecr0p'
            }
        }

    }
}