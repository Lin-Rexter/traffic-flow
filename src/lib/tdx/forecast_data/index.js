import util from 'util'
import { Supabase_CRUD } from '@/lib/supabase/client'
import { Congestion_color as Congestion_colors } from '@/lib/map/mapconfig'

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

// 取得 TDX Forecast Data
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

    const Date_Search = validation_date
    console.log(`\n正在取得'${Date_Search.toISOString().split('T')[0]}'的TDX壅塞預測資料...`)

    try {
        const Supabase = new Supabase_CRUD()

        // 取得TDX壅塞預測資料
        /** - 格式:
                        - [ { SectionID: '', Geometry: [[], []] }, {}...]
                */
        var Live_Result = await Supabase.read({
            table: 'Live_Forecast_Data',
            options: { count: true },
            filters: { eq: ["update_time", new Date(Date_Search).toISOString()] },
            modifiers: { csv: false }
        })

        /** - 格式:
                - [ { section_id: '', level: '', update_time: '', update_interval: 60, travel_time: '', travel_speed: '' }, {}...]
        */
        var Shape_Result = await Supabase.read({
            table: 'SectionShape_Data'
        })

        /** - 格式:
                - [ { SectionID: '', SectionName: '' }, {}...]
        */
        var Section_Result = await Supabase.read({
            table: 'Section_Data'
        })

        // 檢查是否取得壅塞資料
        if (Live_Result.count == 0) {
            Return_Result.error = '目前尚無該時間段的資料，請更改其他時間!'
            console.error('[Get_TDX_Forecast] ERROR: 取得0筆資料，請確認日期是否有誤!')
            return Return_Result
        }

        Return_Result.data = {
            Live_Result: Live_Result,
            Shape_Result: Shape_Result,
            Section_Result: Section_Result
        }

        // 檢查取得結果是否有誤
        if (Object.values(Return_Result.data).every((result) => result?.error)) {
            let Error_msgs = {}
            Object.entries(Return_Result.data).forEach(([key, value], index) => {
                if (value.error) {
                    Error_msgs[key] = value.error;
                }
            })
            Return_Result.error = '目前尚無該時間段的資料，請更改其他時間!'
            console.error(['[Get_TDX_Forecast] ERROR: TDX資料取得失敗', JSON.stringify(Error_msgs, null, 2)])
            return Return_Result
        }

        // = = = = = = 將各個路段的資訊、經緯度、壅塞程度合併 = = = = = =
        // 1. [Shape_Result]: 處理路段座標格式
        var New_Shape_Result = {}
        Shape_Result.data.forEach((item) => {
            let SectionID = item.SectionID
            let Geometry = item.Geometry
            Geometry.forEach((item, index) => {
                Geometry[index] = item.map(Number)
            })
            New_Shape_Result[SectionID] = Geometry
        })
        Shape_Result.data = New_Shape_Result

        // 2. [Section_Result]: 處理路段資訊格式
        var New_Section_Result = {}
        Section_Result.data.forEach((item) => {
            let SectionID = item.section_id
            let SectionName = item.section_name
            New_Section_Result[SectionID] = SectionName
        })
        //console.log(New_Section_Result)
        Section_Result.data = New_Section_Result


        // 壅塞等級對應的壅塞資訊
        const Congestion_color = Congestion_colors

        var Section_GeoJSON = {
            "type": "FeatureCollection",
            "features": []
        }

        const Live_Data = Live_Result.data
        const Shape_Data = Shape_Result.data
        const Section_Data = Section_Result.data
        //console.log(Section_Data)
        Live_Data.forEach((item) => {
            let SectionID = item.section_id
            let Section_Name = Section_Data[SectionID] // 路段名稱
            //let random_num = Math.round(((Math.random() * 4) + 1)) + '';
            //console.log(random_num)
            let congestion_info = Congestion_color[item.level] // 取得壅塞等級對應的壅塞資訊
            let update_time = new Date(item.update_time).addHours(8) // 取得更新時間
            let update_interval = item.update_interval // 更新頻率
            let travel_time = item.travel_time // 旅行時間
            let travel_speed = item.travel_speed // 旅行速度
            let coordinates = Shape_Data[SectionID] // 路段座標
            if (travel_speed == 250) {
                congestion_info = Congestion_color['-1']
            }
            Section_GeoJSON.features.push({
                "type": "Feature",
                "properties": {
                    "name": Section_Name,
                    "id": SectionID,
                    "describe": congestion_info[0],
                    "color": congestion_info[1],
                    "update_time": update_time,
                    "update_interval": update_interval,
                    "travel_time": travel_time,
                    "travel_speed": travel_speed
                },
                "geometry": { "type": "MultiLineString", "coordinates": [coordinates] }
            })
        })

        Return_Result.data = Section_GeoJSON
        return Return_Result
    } catch (e) {
        console.error('[Get_TDX_Forecast] ERROR: ', e)
        Return_Result.error = e.message || e.toString()
        return Return_Result
    }
}