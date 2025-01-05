'use client'
//import { useENV } from "@/context";
import { createClient } from '@supabase/supabase-js'


// 需要改為SUPABASE_URL、SUPABASE_ANON_KEY，使用useENV取得
export function createClient_withoutSSR(supabase_url = null, supabase_key = null) {
    // 載入環境變數
    //const { ENVConfig, setENVConfig } = useENV();

    return createClient(
        supabase_url ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_key ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
}