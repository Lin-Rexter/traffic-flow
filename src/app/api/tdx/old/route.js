import { NextResponse } from 'next/server'
import GetAccessToken from '@/lib/tdx/auth'
import Fetch_Data from '@/lib/tdx/fetch_all'
import { Get_TDX_History } from '@/lib/tdx/historical_data'


// 回應請求的資料
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)

        /*
        if (searchParams.get('db_test') === 'true') {
            return NextResponse.json(await Store_TDX_History({ test: true }))
        }
        */

        // = = = = = = = = Authorizations = = = = = = = =
        const Client_ID = process.env.NEXT_PUBLIC_Client_ID;
        const Client_Secret = process.env.NEXT_PUBLIC_Client_Secret
        const AccessToken = await GetAccessToken(Client_ID, Client_Secret, searchParams.get('test') === 'true')

        // = = = = = = = = 取得資料 = = = = = = = =
        // 設置要取得的資料url - 歷史資料
        const Dates = searchParams.get('Date') || '2024-08-05'
        const Date_Search = `Dates=${Dates}`
        const history_urls = {
            history_freeway_shape_url: `https://tdx.transportdata.tw/api/historical/v2/Historical/Road/Traffic/SectionShape/Freeway?${Date_Search}&format=JSONL`, // ?$top=1，各個路段的經緯度
            //history_freeway_live_url: `https://tdx.transportdata.tw/api/historical/v2/Historical/Road/Traffic/Live/Freeway?${Date_Search}&format=JSONL`, // 各個路段的壅塞程度
            history_freeway_section_url: `https://tdx.transportdata.tw/api/historical/v2/Historical/Road/Traffic/Section/Freeway?${Date_Search}&format=JSONL` // 各個路段代號的資訊
        }

        // 取得所有選擇的TDX資料
        const [Fetch_Result, Fetch_Info] = await Fetch_Data(AccessToken, history_urls, true)
        const [shape_result, section_result] = Fetch_Result
        const live_result = await Get_TDX_History(Dates)
        const [fetch_status_code, fetch_data, fetch_error, fetch_error_format] = Fetch_Info

        // 顯示請求回應資訊
        const fetch_response = `
            ====================================
            請求狀態碼: ${fetch_status_code}
            請求回應原始訊息: ${fetch_status_code.every((code) => code != 200) ? JSON.stringify(fetch_data, null, 2) : "無"}
            請求回應原始錯誤訊息: ${fetch_error.length != 0 ? fetch_error : '無'}
            請求回應錯誤訊息: ${fetch_error_format.length != 0 ? fetch_error_format : '無'}
            ====================================
        `.replaceAll(' ', '')
        console.log(fetch_response)

        // 檢查是否成功請求資料
        if (fetch_status_code.every((code) => code == 200)) {
            // = = = = = = = = 合併資料 = = = = = = = =

            // 1. 儲存各個路段的經緯度
            const SectionShapes_list = []
            var SectionShapes = shape_result
            SectionShapes.map((item) => {
                SectionShapes_list.push(item)
            })
            // 處理1.的經緯度字串格式
            SectionShapes_list.map((item) => {
                const temp_geometry_list = []
                const Geometry_slipt = item.Geometry.replace('LINESTRING(', '').replace(')', '').split(',')
                Geometry_slipt.forEach((item) => {
                    temp_geometry_list.push(item.split(' ').map(Number))
                })

                // 將處理後的經緯度格式取代原本的經緯度字串
                item.Geometry = temp_geometry_list
            })
            //console.log(SectionShapes_list)

            // 2. 儲存各個路段ID的壅塞程度、更新時間、更新頻率、旅行時間、旅行速度

            const Live_Congestion_list = live_result
            /*
            var LiveTraffics = live_result
            var Update_Interval = 60
            LiveTraffics.map((item) => {
                let section_id = item.SectionID
                let level = item.CongestionLevel
                let travel_time = item.TravelTime
                let update_time = item.SrcUpdateTime
                let travel_speed = item.TravelSpeed
                Live_Congestion_list[section_id] = [level, update_time, Update_Interval, travel_time, travel_speed]
            })
            //console.log(Live_Congestion_list)
            */

            // 3. 儲存各個路段ID的路段資訊
            const section_list = {}
            var Sections = section_result
            Sections.forEach((item) => {
                section_list[item.SectionID] = item.SectionName
            })

            // 4. 將各個路段的經緯度跟壅塞程度合併
            // 壅塞等級對應的壅塞資訊
            const Congestion_color = {
                '1': ['最順暢🔵', '#005ff5'], // 最順暢
                '2': ['順暢🟢', '#00ff4c'],
                '3': ['正常🟡', '#ffff37'],
                '4': ['壅塞🟠', '#ff8000'],
                '5': ['最壅塞🔴', '#ff0000'], // 最壅塞
                '-1': ['道路封閉⛔', '#693b3b'] // 道路封閉
            }
            var section_geojson = {
                "type": "FeatureCollection",
                "features": []
            }
            SectionShapes_list.forEach((item) => {
                let Section_Name = section_list[item.SectionID] // 路段名稱
                let Live_Congestion = Live_Congestion_list[item.SectionID]; // 取得壅塞等級
                //let random_num = Math.round(((Math.random() * 4) + 1)) + '';
                //console.log(random_num)
                let congestion_info = Congestion_color[Live_Congestion[0]] // 取得壅塞等級對應的壅塞資訊
                let update_time = Live_Congestion[1] // 取得更新時間
                let update_interval = Live_Congestion[2] // 更新頻率
                let travel_time = Live_Congestion[3] // 旅行時間
                let travel_speed = Live_Congestion[4] // 旅行速度
                section_geojson.features.push({
                    "type": "Feature",
                    "properties": {
                        "name": Section_Name,
                        "id": item.SectionID,
                        "describe": congestion_info[0],
                        "color": congestion_info[1],
                        "update_time": update_time,
                        "update_interval": update_interval,
                        "travel_time": travel_time,
                        "travel_speed": travel_speed
                    },
                    "geometry": { "type": "MultiLineString", "coordinates": [item.Geometry] }
                })
            })
            //console.log(section_geojson)

            return NextResponse.json({ section_geojson }, { status: 200 }) // { status: 200 }可省略
        } else {
            return NextResponse.json({ data: fetch_data, error_data: fetch_error_format, status: fetch_status_code }, { status: 200 })
        }
    } catch (error) {
        console.log('error', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}