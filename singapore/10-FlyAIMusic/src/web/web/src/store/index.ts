import { createPinia } from "pinia"
import { createPersistedState } from 'pinia-persistedstate-plugin'
const pinia = createPinia();
pinia.use(createPersistedState())
export default pinia
