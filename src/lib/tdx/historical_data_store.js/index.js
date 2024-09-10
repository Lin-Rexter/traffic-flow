import util from 'util'
import GetAccessToken from '@/lib/tdx/auth'
import Fetch_Data from '@/lib/tdx/fetch_all'
import { Supabase_CRUD } from '@/lib/supabase/client'
import { ColumnLayer } from 'deck.gl'


// 取得 TDX History Data
export async function Store_TDX_Historical({ date, useExistToken = true }) {
    // 回應格式
    var Return_Result = {
        data: null,
        error: null
    }

    // 檢查日期格式
    const validation_date = util.types.isDate(date) ? date : null
    if (validation_date == null) {
        Return_Result.error = "[Get_TDX_Historical] ERROR: 日期格式錯誤!"
        return Return_Result
    }

    const Date_Search = validation_date.toISOString().split('T')[0]
    console.log(`\n正在取得'${validation_date}'的TDX壅塞歷史資料...`)

    try {
        // = = = = = = = = Authorizations = = = = = = = =
        const Client_ID = process.env.NEXT_PUBLIC_Client_ID;
        const Client_Secret = process.env.NEXT_PUBLIC_Client_Secret
        const AccessToken = await GetAccessToken(Client_ID, Client_Secret, useExistToken)

        // = = = = = = = = 取得資料 = = = = = = = =

        // 設置要取得的資料url - 即時資料
        const real_time_urls = {
            freeway_live_url: `https://tdx.transportdata.tw/api/historical/v2/Historical/Road/Traffic/Live/Freeway?Dates=${Date_Search}&format=JSONL`, // 各個路段的壅塞程度
        }

        // 取得所有選擇的TDX資料
        const [Fetch_Result, Fetch_Info] = await Fetch_Data(AccessToken, real_time_urls, true)
        const [live_result] = Fetch_Result
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

        // 檢查是否成功請求資料
        if (fetch_status_code.every((code) => code == 200)) {
            // 處理live_result資料
            const live_result_list = []
            live_result.forEach((item) => {
                if ((new Date(item.SrcUpdateTime).getHours() % 4) === 0) {
                    let Column = {
                        section_id: item.SectionID,
                        level: item.CongestionLevel,
                        update_time: item.SrcUpdateTime,
                        update_interval: 60,
                        travel_time: item.TravelTime,
                        travel_speed: item.TravelSpeed,
                    }
                    live_result_list.push(Column)
                }
            })

            // 儲存TDX資料到 Supabase
            const Supabase = new Supabase_CRUD()

            // 因資料量大，分批新增至資料庫
            const chunk = (arr, size) => arr.reduce(
                (carry, _, index, orig) => !(index % size)
                ? carry.concat([orig.slice(index,index+size)])
                : carry, []
            );
            const chunkSize = chunk(live_result_list, 50000)
            const chunkedArray = []
            while (live_result_list.length > 0) {
                chunkedArray.push(live_result_list.splice(0, chunkSize))
            }

            const Live_Store_Result = await Promise.all(chunkedArray.map(async (chunk) => {
                return await Supabase.upsert({
                    table: 'Live_Data',
                    data: chunk,
                    //options: { count: true }
                })
            }))

            Return_Result.data = {  
                Live_Result: Live_Store_Result
            }

            // 檢查取得結果是否有誤
            if (Object.values(Return_Result.data).every((result) => result?.error)) {
                let Error_msgs = {}
                Object.entries(Return_Result.data).forEach(([key, value], index) => {
                    if (value.error) {
                        Error_msgs[key] = value.error;
                    }
                })
                Return_Result.error = ['[Get_TDX_Historical] ERROR: TDX資料儲存失敗', JSON.stringify(Error_msgs, null, 2)]
                return Return_Result
            }

            Return_Result.data = live_result_list.slice(0, 100)

            return Return_Result
        } else {
            Return_Result.error = { data: fetch_data, error_data: fetch_error_format, status: fetch_status_code }
            return Return_Result
        }
    } catch (e) {
        console.error('[Get_TDX_Live] ERROR: ', e)
        Return_Result.error = e.message || e.toString()
        return Return_Result
    }
}