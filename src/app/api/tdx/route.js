import { NextResponse } from 'next/server'

// 請求TDX的Token
async function GetToken(id, secret) {
    // 設置預設金鑰的ID、Secret
    const parameter = {
        grant_type: "client_credentials",
        client_id: id,
        client_secret: secret
    };

    // 平台的API不收JSON，所以將金鑰轉換成需求的格式(application/x-www-form-urlencoded)
    const requestBody = new URLSearchParams(Object.entries(parameter)).toString();

    // 用來申請token的API
    const auth_url = "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";

    // = = = = = = = = 請求方式 1 = = = = = = = =
    /*
    var options = {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: requestBody
    };

    const res = await fetch(auth_url, options)
    const data = await res.json()
    return data.access_token
    */

    //  = = = = = = = = 請求方式 2 = = = = = = = =
    var result = await fetch(auth_url, {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: requestBody
    }).then((res) => {
        const data = res.json();
        return data
    }).then((data) => {
        const token = data.access_token;
        return token
    }).catch((err) => {
        console.log('錯誤:', err);
    })

    return result
}

// 回應請求的資料
export async function GET() {
    // = = = = = = = = Authorizations = = = = = = = =
    const Client_ID = process.env.NEXT_PUBLIC_Client_ID;
    const Client_Secret = process.env.NEXT_PUBLIC_Client_Secret
    const AccessToken = await GetToken(Client_ID, Client_Secret)

    // = = = = = = = = 取得資料 = = = = = = = =
    // 各個路段的經緯度
    const freeway_shape_url = 'https://tdx.transportdata.tw/api/basic/v2/Road/Traffic/SectionShape/Freeway' // ?$top=1
    // 各個路段的壅塞程度
    const freeway_live_url = 'https://tdx.transportdata.tw/api/basic/v2/Road/Traffic/Live/Freeway'
    // 各個路段代號的資訊
    const freeway_section_url = 'https://tdx.transportdata.tw/api/basic/v2/Road/Traffic/Section/Freeway'

    // 檢查是否成功取得Token
    if (AccessToken != undefined) {
        // 取得各個路段的經緯度
        var shape_result = await fetch(freeway_shape_url, {
            method: "GET",
            headers: {
                "authorization": "Bearer " + AccessToken,
            },
        }).then((res) => {
            const data = res.json();
            return data
        }).then((data) => {
            //console.log(data)
            return data
        }).catch((err) => {
            console.log('錯誤:', err);
        })

        // 取得各個路段的壅塞程度
        var live_result = await fetch(freeway_live_url, {
            method: "GET",
            headers: {
                "authorization": "Bearer " + AccessToken,
            },
        }).then((res) => {
            return res.json();
        }).then((data) => {
            return data
        }).catch((err) => {
            console.log('錯誤:', err);
        })

        // 取得各個路段代號的資訊
        var section_result = await fetch(freeway_section_url, {
            method: "GET",
            headers: {
                "authorization": "Bearer " + AccessToken,
            },
        }).then((res) => {
            return res.json();
        }).then((data) => {
            return data
        }).catch((err) => {
            console.log('錯誤:', err);
        })
    }

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
    const Congestion_color = {
        '1': ['最順暢🔵', '#005ff5'], // 最順暢
        '2': ['順暢🟢', '#00ff4c'],
        '3': ['正常🟡', '#ffff37'],
        '4': ['壅塞🟠', '#ff8000'],
        '5': ['最壅塞🔴', '#ff0000'], // 最壅塞
        '-1': ['道路封閉⛔', '#4a3634'] // 道路封閉
    }
    var section_geojson = {
        "type": "FeatureCollection",
        "features": []
    }
    SectionShapes_list.forEach((item) => {
        let Section_Name = section_list[item.SectionID] // 路段名稱
        let Live_Congestion = Live_Congestion_list[item.SectionID]; // 取得壅塞等級
        let congestion_info = Congestion_color[Live_Congestion[0]] // 取得壅塞等級對應的壅塞資訊
        let update_time = Live_Congestion[1] // 取得更新時間
        let update_interval = Live_Congestion[2] // 更新頻率
        let travel_time = Live_Congestion[3] // 旅行時間
        let travel_speed = Live_Congestion[4] // 旅行速度
        section_geojson.features.push(
            {
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
            }
        )
    })
    //console.log(section_geojson)

    // 也可使用擴充版本的 NextResponse
    return NextResponse.json({ section_geojson }, { status: 200 }) // { status: 200 }可省略
}