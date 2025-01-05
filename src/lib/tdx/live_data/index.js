import GetAccessToken from '@/lib/tdx/auth'
import Fetch_Data from '@/lib/tdx/fetch_TDX'
import { Congestion_color as Congestion_colors} from '@/lib/map/mapconfig'


Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

// 取得 TDX Live Data
export async function Get_TDX_Live({ useExistToken = true }) {
    // 回應格式
    var Return_Result = {
        data: null,
        error: null
    }

    try {
        // = = = = = = = = Authorizations = = = = = = = =
        const Client_ID = process.env.TDX_CLIENT_ID;
        const Client_Secret = process.env.TDX_CLIENT_SECRET;
        const AccessToken_info = await GetAccessToken(Client_ID, Client_Secret, useExistToken)

        // = = = = = = = = 取得資料 = = = = = = = =
        // 設置要取得的資料url - 即時資料
        const real_time_urls = {
            freeway_shape_url: 'https://tdx.transportdata.tw/api/basic/v2/Road/Traffic/SectionShape/Freeway', // ?$top=1，各個路段的經緯度
            freeway_live_url: 'https://tdx.transportdata.tw/api/basic/v2/Road/Traffic/Live/Freeway', // 各個路段的壅塞程度
            freeway_section_url: 'https://tdx.transportdata.tw/api/basic/v2/Road/Traffic/Section/Freeway' // 各個路段代號的資訊
        }

        // 取得所有選擇的TDX資料
        const [Fetch_Result, Fetch_Info] = await Fetch_Data({
            AccessToken: AccessToken_info?.AccessToken,
            Token_Expires: AccessToken_info?.Expires_ms,
            urls: real_time_urls
        })
        const [shape_result, live_result, section_result] = Fetch_Result

        // 檢查是否成功請求資料
        if (!AccessToken_info.Error && Fetch_Info.fetch_OK) {
            // = = = = = = = = 合併資料 = = = = = = = =

            // 1. 儲存各個路段的經緯度
            const SectionShapes_list = []
            var SectionShapes = shape_result.SectionShapes
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
            const Live_Congestion_list = {}
            var LiveTraffics = live_result.LiveTraffics
            var update_time = live_result.SrcUpdateTime
            var Update_Interval = live_result.UpdateInterval
            LiveTraffics.map((item) => {
                let section_id = item.SectionID
                let level = item.CongestionLevel
                let travel_time = item.TravelTime
                let travel_speed = item.TravelSpeed
                Live_Congestion_list[section_id] = [level, update_time, Update_Interval, travel_time, travel_speed]
            })

            //console.log(Live_Congestion_list)

            // 3. 儲存各個路段ID的路段資訊
            const section_list = {}
            var Sections = section_result.Sections
            Sections.forEach((item) => {
                section_list[item.SectionID] = item.SectionName
            })

            // 4. 將各個路段的經緯度跟壅塞程度合併
            // 壅塞等級對應的壅塞資訊
            const Congestion_color = Congestion_colors
            var Section_GeoJSON = {
                "type": "FeatureCollection",
                "features": []
            }
            SectionShapes_list.forEach((item) => {
                let Section_Name = section_list[item.SectionID] // 路段名稱
                let Live_Congestion = Live_Congestion_list[item.SectionID]; // 取得當前路段的總壅塞資訊
                //let random_num = Math.round(((Math.random() * 4) + 1)) + '';
                //console.log(random_num)
                if (Live_Congestion?.length > 0){
                    let congestion_info = Congestion_color[Live_Congestion[0]] // 取得壅塞等級對應的壅塞資訊
                    let update_time = new Date(Live_Congestion[1]).addHours(8) // 取得更新時間
                    let update_interval = Live_Congestion[2] // 更新頻率
                    let travel_time = Live_Congestion[3] // 旅行時間
                    let travel_speed = Live_Congestion[4] // 旅行速度
                    if (travel_speed == 250) {
                        congestion_info = Congestion_color['-1']
                    }
                    Section_GeoJSON.features.push({
                        "type": "Feature",
                        "properties": {
                            "name": Section_Name,
                            "id": item.SectionID,
                            "describe": congestion_info[0],
                            "color": congestion_info[1],
                            //"congestion_level": Live_Congestion[0],
                            "update_time": update_time,
                            "update_interval": update_interval,
                            "travel_time": travel_time,
                            "travel_speed": travel_speed
                        },
                        "geometry": { "type": "MultiLineString", "coordinates": [item.Geometry] }
                    })
                }
            })
            //console.log(Section_GeoJSON)

            Return_Result.data = Section_GeoJSON
            return Return_Result
        } else {
            Return_Result.error = {
                //data: Fetch_Info.fetch_data,
                error: Fetch_Info.fetch_exception_error || Fetch_Info.fetch_error_format, // || Fetch_Info.fetch_exception_error,
                status: Fetch_Info.fetch_status_code || AccessToken_info.status_code
            }
            return Return_Result
        }
    } catch (e) {
        console.error('[Get_TDX_Live] ERROR: ', e)
        Return_Result.error = e.message || e.toString()
        return Return_Result
    }
}