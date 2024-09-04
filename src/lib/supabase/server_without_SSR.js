'use client'
import { createClient } from '@supabase/supabase-js'


export function createClient_withoutSSR(supabase_url=null, supabase_key=null) {
    return createClient(
        supabase_url ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_key ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
}