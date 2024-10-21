// plugins/supabase.client.js
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
    const supabaseUrl = 'YOUR_SUPABASE_URL'
    const supabaseKey = 'YOUR_SUPABASE_KEY'

    const supabase = createClient(supabaseUrl, supabaseKey)

    return {
        provide: {
            supabase
        }
    }
})
