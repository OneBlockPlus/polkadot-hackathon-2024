const {
    bitcoin,
    ODLT,
    inscription,
} = require('@omniverselab/bitcoin-lib')

module.exports = {
    setProvider(url, user, password) {
        bitcoin.setProvider(url)
        bitcoin.setUser(user)
        bitcoin.setPassword(password)
    },

    async sendRawTransaction(rawTx) {
        return await bitcoin.sendrawtransaction(rawTx)
    },

    async getFeeRate() {
        return await bitcoin.estimateGas()
    }
}
