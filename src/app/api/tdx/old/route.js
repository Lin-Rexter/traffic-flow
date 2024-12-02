import util from 'util';
import { NextResponse } from 'next/server'
import { Get_TDX_Historical } from '@/lib/tdx/historical_data'


/**
    - ## 請求範例:
        ```js
        - api/tdx/old?days=3
        ```
    ---
    - ## 參數說明:
        - **days: 取得指定天數前的壅塞歷史資料**
        - **Date: 取得特定日期的壅塞歷史資料**
*/
export async function GET(request) {
    try {
        // = = = = = = = = 取得參數 = = = = = = = =
        const { searchParams } = new URL(request.url)
        const Days = searchParams.get('days')
        const Date_Param = new Date(searchParams.get('date'))
        const Dates = util.types.isDate(Date_Param) ? new Date(Date_Param) : null

        // 取得指定天數前的日期(不包含時間)
        const days_millisecond = (days) => days * 24 * 60 * 60 * 1000
        const past_date = new Date(Date.now() - days_millisecond(Number(Days))).setHours(12, 0, 0);

        // 取得TDX壅塞歷史資料
        const TDX_Historical_Result = await Get_TDX_Historical({
            date: Dates || past_date,
        })

        return NextResponse.json({ ...TDX_Historical_Result }, { status: 200 }) // { status: 200 }可省略
    } catch (error) {
        console.error(`\n發生例外錯誤: ${'=' * 10}\n${error}\n${'=' * 10}`)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}