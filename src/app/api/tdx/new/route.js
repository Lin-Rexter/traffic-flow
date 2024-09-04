import { NextResponse } from 'next/server'
import { Get_TDX_Live } from '@/lib/tdx/live_data'


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
        const isTrue = (Params) => searchParams.get(Params) === 'true'

        // 取得TDX壅塞即時資料
        const TDX_Live_Result = await Get_TDX_Live({
            useExistToken: isTrue('test_token')
        })

        return NextResponse.json({ ...TDX_Live_Result }, { status: 200 }) // { status: 200 }可省略
    } catch (error) {
        console.log(`\n發生例外錯誤: ${'=' * 10}\n${error}\n${'=' * 10}`)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}