'use strict'
const config = require('config')
const request = require('sync-request')

class chainHandlerMgr {
    constructor() {
        this.chainHandlers = {}
        /* After a message is initiated, and transported across all the Omniverse DLT,
        we must trace the executing result on each chain
        */
        this.messageObserver = {}
    }

    async init() {
        MainLogger.info('Init chainHandlerMgr')
        let networks = config.get('networks')
        for (let i in networks) {
            let network = networks[i]
            let handler = require('./' + network['compatibleChain'] + '/index')
            let inst = new handler(i)
            this.chainHandlers[network.omniverseChainId] = inst
            await inst.init(this)
        }
    }

    getHandlerByName(name_) {
        for (let i in this.chainHandlers) {
            let handler = this.chainHandlers[i]
            if (handler.chainName == name_) {
                return handler
            }
        }
        let stack = new Error().stack
        MainLogger.error(
            utils.format(
                'Chain handler {0} can not be found, {1}',
                name_,
                stack
            )
        )
        return
    }

    async run() {
        while (true) {
            let updates = [];
            for (let i in this.chainHandlers) {
                updates.push(this.chainHandlers[i].update());
            }
            await Promise.all(updates);
            await utils.sleep(config.get('scanInterval'));
        }
    }
}

let mgr = new chainHandlerMgr()
module.exports = mgr
