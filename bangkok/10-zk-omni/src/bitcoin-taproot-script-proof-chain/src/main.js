const chainHandlerMgr = require('./basic/chainHandlerMgr')
const S3 = require('./utils/s3')
const utils = require('./utils/utils')
global.config = require('config')
global.logger = require('./utils/logger')
global.logger.init()
global.utils = require('./utils/utils')
global.stateDB = require('./utils/stateDB')
global.MainLogger = global.logger.getLogger('main')
global.db = require('./utils/db')
global.s3 = new S3()

async function init() {
    global.stateDB.init(config.get('stateDB'))
    await chainHandlerMgr.init()
    await global.db.run()
    await global.s3.run()
}

async function main() {
    MainLogger.info('Launch sender...')
    await init()
    MainLogger.info('Sender running...')
    await chainHandlerMgr.run()
}

async function resume() {
    await utils.sleep(10)
    await chainHandlerMgr.run()
}

main()

process.on('unhandledRejection', async (err) => {
    MainLogger.error('UnhanledRejection', err)
    if (err instanceof Error) {
        if (err.message.includes('Fatal')) {
            process.exit();
        }
    }

    await resume();
})

process.on('uncaughtException', async (err) => {
    MainLogger.error('UnhanledException', err)
    if (err instanceof Error) {
        if (err.message.includes('Fatal')) {
            process.exit();
        }
    }
    
    await resume();
})
