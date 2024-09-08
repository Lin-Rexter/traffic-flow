import { NextResponse } from 'next/server'
import { Get_TDX_Forecast } from '@/lib/tdx/forecast_data'


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const isTrue = (Params) => searchParams.get(Params) === 'true'

        // 取得TDX壅塞預測資料
        const TDX_Forecast_Result = await Get_TDX_Forecast({
            useExistToken: isTrue('test_token')
        })

        return NextResponse.json({ ...TDX_Forecast_Result }, { status: 200 })
    } catch (error) {
        console.log(`\n發生例外錯誤: ${'=' * 10}\n${error}\n${'=' * 10}`)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}