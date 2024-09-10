import { NextResponse } from 'next/server'
import { Store_TDX_Historical } from '@/lib/tdx/historical_data_store.js'


/**
    - ## 請求範例:
        ```js
        - api/tdx/new?test_token=true
        ```
    ---
    - ## 參數說明:
        - **test_token: 為true表示使用手動儲存的Token**
*/
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const Days = searchParams.get('days')
        const isTrue = (Params) => searchParams.get(Params) === 'true'

        // 取得指定天數前的日期(不包含時間)
        const days_millisecond = (days) => days * 24 * 60 * 60 * 1000
        const past_date = new Date(Date.now() - days_millisecond(Number(Days)))

        // 取得TDX壅塞即時資料
        const TDX_Store_Result = await Store_TDX_Historical({
            date: past_date,
            useExistToken: isTrue('test_token')
        })

        return NextResponse.json({ ...TDX_Store_Result }, { status: 200 }) // { status: 200 }可省略
    } catch (error) {
        console.log(`\n發生例外錯誤: ${'=' * 10}\n${error}\n${'=' * 10}`)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}