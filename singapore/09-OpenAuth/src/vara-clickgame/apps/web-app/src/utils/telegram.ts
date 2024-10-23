import WebApp from '@twa-dev/sdk'

export const START_TIME = Date.now()

export const APP_ID = import.meta.env.PROD ? 'vara_click_bot' : 'tona_dev_bot'
export const IS_TELEGRAM = !!(WebApp?.initData ?? import.meta.env.VITE_TELEGRAME_INIT_DATA)
