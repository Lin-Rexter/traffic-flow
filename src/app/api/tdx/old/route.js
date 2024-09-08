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
*/
export async function GET(request) {
    try {
        // = = = = = = = = 取得參數 = = = = = = = =
        const { searchParams } = new URL(request.url)
        //const Date_Param = searchParams.get('Date')
        //const Dates = util.types.isDate(Date_Param) ? Date_Param : null
        const Days = searchParams.get('days')

        // 取得指定天數前的日期(不包含時間)
        const days_millisecond = (days) => days * 24 * 60 * 60 * 1000
        const past_date = new Date(Date.now() - days_millisecond(Number(Days)))

        // 取得TDX壅塞歷史資料
        const TDX_Historical_Result = await Get_TDX_Historical({
            date: past_date
        })

        return NextResponse.json({ ...TDX_Historical_Result }, { status: 200 }) // { status: 200 }可省略
    } catch (error) {
        console.log(`\n發生例外錯誤: ${'=' * 10}\n${error}\n${'=' * 10}`)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}