const supabase = require('../services/database');
const { getApi, disconnectApi } = require('../services/apiProvider');
const { readSecret } = require('../services/vault');

async function storeVote(telegramId, proposalId, voteDecision, voteBalance, voteHash, conviction) {
    const { data, error } = await supabase
        .from('votes')
        .insert({
            telegram_id: telegramId,
            proposal_id: proposalId,
            vote_decision: voteDecision,
            vote_balance: voteBalance,
            vote_hash: voteHash,
            vote_conviction: conviction
        });

    if (error) throw error;
    return data;
}

async function getUserVotingHistory(telegramId) {
    const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .eq('telegram_id', telegramId)
        .order('created_at', { ascending: false });

    if (votesError) throw votesError;

    const proposalIds = votes.map(vote => vote.proposal_id);
    const { data: referendums, error: referendumsError } = await supabase
        .from('referendums')
        .select('post_id, title')
        .in('post_id', proposalIds);

    if (referendumsError) throw referendumsError;

    return votes.map(vote => ({
        ...vote,
        title: referendums.find(ref => ref.post_id === vote.proposal_id)?.title || 'Unknown Title'
    }));
}

async function submitVote(telegramId, proposalId, vote, balance, conviction) {
    const api = await getApi();
    try {
        const userData = await supabase
            .from('users')
            .select('proxy_mnemonic_id, proxy_address, voter_address')
            .eq('telegram_id', telegramId)
            .single();

        if (!userData.data) throw new Error('User not found');

        const mnemonic = await readSecret(userData.data.proxy_mnemonic_id);
        const keyring = new api.Keyring({ type: 'sr25519' });
        const account = keyring.addFromMnemonic(mnemonic);

        const voteValue = vote === 'aye';
        const convictionValue = api.createType('Conviction', conviction);
        const voteBalance = api.createType('Balance', balance * 1e10);

        const extrinsic = api.tx.convictionVoting.vote(proposalId, {
            Standard: {
                vote: { aye: voteValue, conviction: convictionValue },
                balance: voteBalance
            }
        });

        const hash = await new Promise((resolve, reject) => {
            extrinsic.signAndSend(account, ({ status, events, dispatchError }) => {
                if (dispatchError) {
                    reject(new Error(dispatchError.toString()));
                } else if (status.isInBlock || status.isFinalized) {
                    resolve(status.asInBlock.toHex());
                }
            }).catch(reject);
        });

        await storeVote(telegramId, proposalId, vote, balance, hash, conviction);

        return hash;
    } finally {
        await disconnectApi;
    }
}

module.exports = {
    storeVote,
    getUserVotingHistory,
    submitVote
};