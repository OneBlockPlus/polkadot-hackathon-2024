const supabase = require('./database');

async function createSecret(name, secret) {
    const { data, error } = await supabase.rpc('create_secret', { name, secret });
    if (error) throw error;
    return data;
}

async function readSecret(secretId) {
    const { data, error } = await supabase.rpc('read_secret', { secret_id: secretId });
    if (error) throw error;
    return data;
}

module.exports = {
    createSecret,
    readSecret
};