import Fetch_Data from '@/lib/tdx/fetch_all'
import { Supabase_CRUD } from '@/lib/supabase/client'


/*
export async function CRUD_Test() {
    // 測試CRUD
    if (test) {
        const columns = [
            {
                section_id: '0000',
                level: '2',
                update_time: '2024-08-05 04:00:00+00',
                update_interval: 60,
                travel_time: 55,
                travel_speed: 68
            }, {
                section_id: '0001',
                level: '2',
                update_time: '2024-08-05 04:00:00+00',
                update_interval: 60,
                travel_time: 55,
                travel_speed: 68
            }
        ]

        // Result: {data, error}
        // [C] - Create
        const Result = await Supabase.insert({
            values: columns,
            options: { count: true },
            modifiers: { csv: false }
        })
        

        // [R] - Read
        const Result = await Supabase.read({
            columns: 'level',
            options: { count: true, head: false },
            filters: { eq: ["section_id", "0001"] },
            modifiers: { csv: false }
        })
        

        // [U] - Update
        const Result = await Supabase.update({
            values: { level: 30 },
            options: { count: true },
            filters: { eq: ["section_id", "0001"] },
        })
        

        // [UI] - Update with Insert (符合條件則更新，否則插入)
        const Result = await Supabase.upsert({
            values: { id: 614, level: 30, update_interval: 70 },
            options: { count: true } // onConflict
        })
        

        // [D] - Delete
        const Result = await Supabase.delete({
            options: { count: true },
            filters: { eq: ["section_id", "0001"] },
        })

        return Result
    }
}
*/

// 儲存 TDX History Data
export async function Store_TDX_History({ date, accessToken = null, test = false }) {
    const Supabase = new Supabase_CRUD('Livedata')

    const Date_Search = `Dates=${date}`
    console.log(Date_Search)
    const history_urls = {
        history_freeway_live_url: `https://tdx.transportdata.tw/api/historical/v2/Historical/Road/Traffic/Live/Freeway?${Date_Search}&format=JSONL`, // 各個路段的壅塞程度
    }

    const [Fetch_Result, Fetch_Info] = await Fetch_Data(accessToken, history_urls, true)
    const live_result = Fetch_Result
    const [fetch_status_code, fetch_data, fetch_error, fetch_error_format] = Fetch_Info

    // 顯示請求回應資訊
    const fetch_response = `
        =========壅塞資料取得狀態=========
        請求狀態碼: ${fetch_status_code}
        請求回應原始訊息: ${fetch_status_code.every((code) => code != 200) ? JSON.stringify(fetch_data, null, 2) : "無"}
        請求回應原始錯誤訊息: ${fetch_error.length != 0 ? fetch_error : '無'}
        請求回應錯誤訊息: ${fetch_error_format.length != 0 ? fetch_error_format : '無'}
        ================================
    `.replaceAll(' ', '')
    console.log(fetch_response)

    if (fetch_status_code.every((code) => code == 200)) {
        // 儲存各個路段ID的壅塞程度、更新時間、更新頻率、旅行時間、旅行速度
        var Live_Congestion_list = []
        var LiveTraffics = live_result[0]
        var Update_Interval = 60
        LiveTraffics.map((item) => {
            let section_id = item.SectionID
            let level = item.CongestionLevel
            let travel_time = item.TravelTime
            let update_time = item.SrcUpdateTime
            let travel_speed = item.TravelSpeed
            Live_Congestion_list.push(
                {
                    section_id: section_id,
                    level: level,
                    update_time: update_time,
                    update_interval: Update_Interval,
                    travel_time: travel_time,
                    travel_speed: travel_speed
                }
            )
            /*
            if (new Date(update_time).toISOString() == new Date('2024-08-05T12:00:00').toISOString()) {
            }
            */
        })
        //console.log(Live_Congestion_list)

        // 儲存至資料庫
        const Result = await Supabase.insert({
            values: Live_Congestion_list,
            options: { count: true }
        })

        return Result
    }

    return null
}


export async function Get_TDX_History(date) {
    const Supabase = new Supabase_CRUD('Livedata')

    const Live_Result = await Supabase.read({
        options: { count: true },
        filters: { eq: ["update_time", new Date(`${date}T12:00:00`).toISOString()] },
        modifiers: { csv: false }
    })

    // 轉換成 Array 格式
    const Result = Object.keys(Live_Result).map((key) => Live_Result[key])

    var Live_Congestion_list = {}
    Result.map((item) => {
        let section_id = item.section_id
        let level = item.level
        let update_time = item.update_time
        let update_interval = item.update_interval
        let travel_time = item.travel_time
        let travel_speed = item.travel_speed
        Live_Congestion_list[section_id] = [level, update_time, update_interval, travel_time, travel_speed]
    })

    return Live_Congestion_list;
}
