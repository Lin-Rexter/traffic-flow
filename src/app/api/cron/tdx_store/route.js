import { NextResponse } from 'next/server'
import GetAccessToken from '@/lib/tdx/auth'
import { Store_TDX_History } from '@/lib/tdx/historical_data'
//import luxon from 'luxon';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)

        // = = = = = = = = Authorizations = = = = = = = =
        const Client_ID = process.env.NEXT_PUBLIC_Client_ID;
        const Client_Secret = process.env.NEXT_PUBLIC_Client_Secret;
        const AccessToken = await GetAccessToken(Client_ID, Client_Secret, searchParams.get('test') === 'true');

        const days_millisecond = (days) => days * 24 * 60 * 60 * 1000

        const dateObj = new Date();

        // 取得3天前的日期(不包含時間)
        const past_days = new Date(Date.now() - days_millisecond(Number(searchParams.get('days')))).toISOString().split('T')[0]
        console.log(past_days)

        // 儲存歷史資料至資料庫(一次性)
        const Result = await Store_TDX_History({
            date: past_days,
            accessToken: AccessToken,
        })

        //console.log(Result)

        return NextResponse.json({ Result }, { status: 200 }) // { status: 200 }可省略
    } catch (error) {
        console.log('error', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}