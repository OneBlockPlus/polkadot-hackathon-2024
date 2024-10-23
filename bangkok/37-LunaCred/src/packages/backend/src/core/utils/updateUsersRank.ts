import { IUserRank } from '@components/userRank/userRank.interface';
import config from '@config/config';
import {
  createAll,
  deleteAll
} from '@components/userRank/userRank.service';

import { createClient, cacheExchange, fetchExchange } from 'urql';

const client = createClient({
    url: config.subgraphEndpoint,
    exchanges: [cacheExchange, fetchExchange],
});

class UsersRank {
  public async updateRank() {
    try {
        console.log("Updating user ranks");
        let page = 1;
        const pageItems = 1000;
        let allData = [];
        while (true) {
            const usersQuery = `
                query {
                        users(orderBy: credScoreAccrued, orderDirection: desc, first: ${pageItems}, skip: ${
                        (page - 1) * pageItems
                    }) {
                        id
                        address
                        tokenStaked
                        credScoreAccrued
                        credScoreDistributed
                    }
                }`;

            const data = await client.query(usersQuery, {}).toPromise();
            if (!data.data || data.data.users.length == 0) {
                break;
            }

            const userRanksData = data.data.users.map((el, idx) => {
                return {
                    rank: idx + 1 + (page - 1) * 1000,
                    address: el.address.toLowerCase()
                } as IUserRank;
            });
            allData = allData.concat(userRanksData);
            page = page + 1;
        }
        await deleteAll();
        await new Promise(resolve => setTimeout(resolve, 500));
        await createAll(allData);
        console.log("Updated user ranks");
    } catch (error) {
        console.log(error);
    }
  }
}

export default new UsersRank();
