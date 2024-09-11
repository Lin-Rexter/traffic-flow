'use client'
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Source, Layer, Map, Marker } from "react-map-gl"; // 替代方案: 'react-map-gl/maplibre'
import "mapbox-gl/dist/mapbox-gl.css";
//import 'maplibre-gl/dist/maplibre-gl.css';
import DeckGL from 'deck.gl';
import { Button, Toast } from "flowbite-react";
import {
    lightingEffect,
    material,
    INITIAL_VIEW_STATE,
    colorRange,
} from "@/lib/map/mapconfig.js";
import { Layer_GeoJson } from "@/lib/map/layers.js"
import { Toast_Component } from "@/components/utils/toast";
import { Info_Component } from "@/components/Main/traffic/info_drawer.jsx";
import { useGetTraffic } from "@/hooks/useGetTraffic";
import { useTime, useDrawer } from "@/context";


// 取得MapBox金鑰
const mapbox_api_key = process.env.NEXT_PUBLIC_MAPBOX_TOKENS;


// 設置視覺化地圖內容
var last_data = null
//var [data, error, warn] = [null, null, null]
const LocationAggregatorMap = ({ off, useExistToken }) => {
    // 取得時間軸指定日期
    const { selectedTime } = useTime();
    // 取得開啟壅塞詳細側邊欄狀態
    const { showDrawer, setShowDrawer } = useDrawer();

    // 儲存點擊的路段資訊
    const [coordinate, setCoordinate] = useState([0, 0]);
    const [color, setColor] = useState("");
    const [describe, setDescribe] = useState("");
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [travel_speed, setTravel_speed] = useState("");
    const [travel_time, setTravel_time] = useState("");
    const [update_interval, setUpdate_interval] = useState("");
    const [update_time, setUpdate_time] = useState("");

    // 取得壅塞資料
    const [data, error, warn] = useGetTraffic(off, useExistToken, selectedTime)

    if (data) {
        const now = new Date();
        const location_time = now.toLocaleString();
        console.log(`${location_time}: 壅塞資料已更新! (每60秒)`);

        last_data = ((Object.keys(data.data).length == 1) || !data.error) ? data.data : null
    }
    //console.log(last_data)

    // 提示框(tooltip)
    function getTooltip({ object }) {
        if (!object) {
            return null;
        }

        return object && `路段名稱: ${object.properties.name}
    路段代碼: ${object.properties.id}
    壅塞程度: ${object.properties.describe}
    平均旅行速度: ${object.properties.travel_speed}KM/Hr (Ex: 數值250表示為道路封閉)
    平均旅行時間: ${object.properties.travel_time}秒
    更新時間: ${object.properties.update_time}
    更新頻率: ${object.properties.update_interval}秒
    `;
    }


    const onClick = useCallback((info, event) => {
        let section_info = info?.object?.properties
        if (section_info) {
            console.log(section_info)
            setCoordinate(info.coordinate)
            setColor(section_info.color)
            setDescribe(section_info.describe)
            setId(section_info.id)
            setName(section_info.name)
            setTravel_speed(section_info.travel_speed)
            setTravel_time(section_info.travel_time)
            setUpdate_interval(section_info.update_interval)
            setUpdate_time(section_info.update_time)
            setShowDrawer(true)
        }
    }, []);


    return (
        <div className="grid h-full w-full">
            {/* 地圖視覺化 */}
            <DeckGL
                layers={Layer_GeoJson(last_data ? last_data : null)} // 自訂的視覺化圖層(GeoJson)
                effects={[lightingEffect]}
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                getTooltip={getTooltip}
                style={{ width: '100%', height: '100%' }}
                onClick={onClick}
            >
                {/* 以MapBox地圖為基底 */}
                <Map
                    className=""
                    controller={true}
                    mapboxAccessToken={mapbox_api_key}
                    mapStyle="mapbox://styles/retex/clybowush00n301pr4vuz4fbf"
                    onRender={(event) => event.target.resize()}
                >
                    <Marker longitude={121} latitude={23.5} color="red" />
                </Map>
            </DeckGL>
            {
                showDrawer && <Info_Component
                    coordinate={coordinate}
                    color={color}
                    describe={describe}
                    id={id}
                    name={name}
                    travel_speed={travel_speed}
                    travel_time={travel_time}
                    update_interval={update_interval}
                    update_time={update_time}
                />
            }
            {
                warn &&
                <Toast_Component
                    icon_text={"警告訊息"}
                    title={"警告訊息"}
                    contents={warn}
                />
            }
            {
                error &&
                <Toast_Component
                    icon_text={"錯誤訊息"}
                    title={"錯誤訊息 (狀態碼: " + error.status}
                    contents={JSON.stringify(error.info.error, null, 1)}
                />
            }
            {
                (!data && !error) &&
                <Toast_Component
                    icon_text={"系統訊息"}
                    title={"系統訊息"}
                    contents={`正在載入 ${(selectedTime == 0) ? '即時' : Math.abs(selectedTime / 24) + ((selectedTime < 0) ? '天前' : '天後')} 之資料`}
                />
            }
        </div>
    )
}

export default LocationAggregatorMap;