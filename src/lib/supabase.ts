import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://phwaszjkfugpfvpynzle.supabase.co'
const supabaseAnonKey = 'sb_publishable_XEtQoqbDHuHLAPIhDoKorg_NXbhXvqN'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
