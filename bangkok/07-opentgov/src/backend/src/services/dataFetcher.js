const axios = require('axios');
const { getApi, disconnectApi } = require('./apiProvider');
const { queryIdentity } = require('./identity');

async function fetchProposalDescription(proposalId) {
    const url = 'https://api.polkassembly.io/api/v1/posts/on-chain-post';
    const headers = { 'x-network': 'polkadot' };
    const params = {
        proposalType: 'referendums_v2',
        postId: proposalId
    };

    try {
        const response = await axios.get(url, { headers, params });
        return response.data.content;
    } catch (err) {
        console.log(err);
        return '';
    }
}

async function fetchData() {
    const url = 'https://api.polkassembly.io/api/v1/listing/on-chain-posts';
    const headers = { 'x-network': 'polkadot' };
    const params = {
        proposalType: 'referendums_v2',
        listingLimit: 10,
        trackStatus: 'All',
        sortBy: 'newest'
    };

    try {
        const api = await getApi();

        const response = await axios.get(url, { headers, params });
        const posts = response.data.posts;
        const postsWithDescriptions = await Promise.all(posts
            .filter(post => post.method === 'spend' || post.method === 'spend_local')
            .map(async post => {
                const description = await fetchProposalDescription(post.post_id);
                const referendumInfo = await api.query.referenda.referendumInfoFor(post.post_id);
                const proposerName = await queryIdentity(post.proposer);

                let tally = null;

                if (referendumInfo.isSome) {
                    const info = referendumInfo.unwrap();
                    if (info.isOngoing) {
                        const ongoing = info.asOngoing;
                        tally = {
                            ayes: ongoing.tally.ayes.toString().replace(/,/g, ''),
                            nays: ongoing.tally.nays.toString().replace(/,/g, ''),
                            support: ongoing.tally.support.toString().replace(/,/g, '')
                        };
                    }
                }

                return {
                    post_id: post.post_id,
                    assetId: post.assetId,
                    created_at: post.created_at,
                    hash: post.hash,
                    method: post.method,
                    proposer: post.proposer,
                    requestedAmount: post.requestedAmount,
                    status: post.status,
                    title: post.title,
                    track_no: post.track_no,
                    ayes: tally ? tally.ayes : null,
                    nays: tally ? tally.nays : null,
                    support: tally ? tally.support : null,
                    topic_id: post.topic?.id || null,
                    topic_name: post.topic?.name || null,
                    description: description,
                    proposer_name: proposerName
                };
            }));

        await disconnectApi();
        return postsWithDescriptions;

    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

module.exports = {
    fetchData
};