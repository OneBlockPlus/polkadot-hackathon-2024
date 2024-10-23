const supabase = require('../config/supabase');

exports.getStats = async () => {
    const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    const { count: proposalCount, error: proposalError } = await supabase
        .from('referendums')
        .select('*', { count: 'exact', head: true });

    if (proposalError) throw proposalError;

    return {
        userCount,
        proposalCount
    };
};