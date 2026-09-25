import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://njygeooqgeisfihzbfco.supabase.co'
const supabaseKey = 'sb_publishable_htwINJc-neX1JQLKoLxfkg_xLc67kvT'

export const supabase = createClient(supabaseUrl, supabaseKey)
