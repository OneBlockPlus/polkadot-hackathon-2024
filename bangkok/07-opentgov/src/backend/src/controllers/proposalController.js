const supabase = require('../services/database');
const axios = require('axios');
const { createPolkadotApi } = require('../services/polkadot');
const { fetchData } = require('../services/dataFetcher');
const { queryIdentity } = require('../services/identity');

async function fetchProposals(limit = 10) {
    const { data, error } = await supabase
        .from('referendums')
        .select('*')
        .limit(limit);

    if (error) throw error;
    return data;
}

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

module.exports = {
    fetchProposals,
    fetchProposalDescription,
    fetchData
};