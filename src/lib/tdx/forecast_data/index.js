import util from 'util'

export async function Get_TDX_Forecast({ date }) {  
    // 回應格式
    var Return_Result = {
        data: null,
        error: null
    }

    // 檢查日期格式
    const validation_date = util.types.isDate(date) ? date : null
    if (validation_date == null) {
        Return_Result.error = "[Get_TDX_Forecast] ERROR: 日期格式錯誤!"
        return Return_Result
    }

    const Date_Search = validation_date.toISOString().split('T')[0]
    console.log(`\n正在取得'${validation_date}'的TDX壅塞預測資料...`)

    try {
        const Supabase = new Supabase_CRUD()

        // 取得TDX壅塞預測資料

        return Return_Result
    } catch (e) {
        console.error('[Get_TDX_Forecast] ERROR: ', e)
        Return_Result.error = e.message || e.toString()
        return Return_Result
    }
}