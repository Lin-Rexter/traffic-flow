import util from 'util'
import { NextResponse } from 'next/server'
import { Get_TDX_Forecast } from '@/lib/tdx/forecast_data'


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const Days = searchParams.get('days')
        const Date_Param = new Date(searchParams.get('date'))
        const Dates = util.types.isDate(Date_Param) ? new Date(Date_Param) : null

        // 取得指定天數前的日期(不包含時間)
        const days_millisecond = (days) => days * 24 * 60 * 60 * 1000
        const past_date = new Date(Date.now() + days_millisecond(Number(Days))).setHours(12, 0, 0);

        // 取得TDX壅塞預測資料
        const TDX_Forecast_Result = await Get_TDX_Forecast({
            date: Dates || past_date,
        })

        return NextResponse.json({ ...TDX_Forecast_Result }, { status: 200 })
    } catch (error) {
        console.log(`\n發生例外錯誤: ${'=' * 10}\n${error}\n${'=' * 10}`)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}