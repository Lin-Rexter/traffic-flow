import { NextResponse } from 'next/server'


export async function GET(request) {
    // 環境變數映射表
    const envVars = {
        mapbox: {
            style: process.env.MAPBOX_STYLE,
            token: process.env.MAPBOX_TOKENS
        },
        tdx: {
            clientId: process.env.TDX_CLIENT_ID,
            clientSecret: process.env.TDX_CLIENT_SECRET,
            token: process.env.TDX_ACCESS_TOKEN
        },
        polstar: {
            key: process.env.POLSTAR_API_KEY
        },
        gemini: {
            key: process.env.GEMINI_API_KEY
        },
        supabase: {
            url: process.env.SUPABASE_URL,
            key: process.env.SUPABASE_ANON_KEY
        },
        clerk: {
            key: process.env.CLERK_PUBLISHABLE_KEY,
            secret: process.env.CLERK_SECRET_KEY
        }
    };

    return NextResponse.json({...envVars});
}