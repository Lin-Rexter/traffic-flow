'use client'
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Button, FloatingLabel } from "flowbite-react";
import { TbMapSearch } from "react-icons/tb";
import { Source, Layer, Map, Marker } from "react-map-gl"; // 替代方案: 'react-map-gl/maplibre'
import "mapbox-gl/dist/mapbox-gl.css";
//import 'maplibre-gl/dist/maplibre-gl.css';
import DeckGL, { LinearInterpolator, MapViewState, FlyToInterpolator, OrthographicView } from 'deck.gl';
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
import { Client } from "@googlemaps/google-maps-services-js";

//const client = new Client({});

//client.placeQueryAutocomplete();

// 取得MapBox金鑰
const mapbox_api_key = process.env.NEXT_PUBLIC_MAPBOX_TOKENS;

//var [data, error, warn] = [null, null, null]
const LocationAggregatorMap = ({ off, useExistToken }) => {
    // 取得時間軸指定日期
    const { selectedTime } = useTime();
    // 取得開啟壅塞詳細側邊欄狀態
    const { showDrawer, setShowDrawer } = useDrawer();

    // 儲存使用者經緯度
    const [location, setLocation] = useState(null);

    // 儲存觀看座標、縮放等資訊
    const [initialViewState, setInitialViewState] = useState(INITIAL_VIEW_STATE.SF)

    // 儲存緩衝地圖資料
    const [MapData, setMapData] = useState(null);

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

    // 搜尋路段
    const [searchSection, setSearchSection] = useState(false);
    const [search, setSearch] = useState("");

    // 更新初始座標起始點(如果已儲存使用者位置)
    useEffect(() => {
        const UserLocation = JSON.parse(window.localStorage.getItem("UserLocation"));

        if (UserLocation) {
            setInitialViewState(UserLocation)

            INITIAL_VIEW_STATE.SF = UserLocation
        }
    }, [])

    useEffect(() => {
        // 取得使用者經緯度 [使用者同意取得位置權限時]
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                const { latitude, longitude } = coords;

                setLocation({ latitude, longitude });
                INITIAL_VIEW_STATE.NYC.latitude = latitude;
                INITIAL_VIEW_STATE.NYC.longitude = longitude;

                // 儲存至LocalStorage
                window.localStorage.setItem("UserLocation", JSON.stringify(INITIAL_VIEW_STATE.NYC))
            })
        }
    }, []);

    // 前往目標座標點過渡動畫
    useEffect(() => {
        setTimeout(() => {
            setInitialViewState(({
                ...INITIAL_VIEW_STATE['NYC'],
                transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
                transitionDuration: 'auto',
            }));
        }, 1000);
    }, [location]);

    // 取得壅塞資料
    var [data, error, warn] = useGetTraffic(off, useExistToken, selectedTime)

    // 更新壅塞緩存資料
    useEffect(() => {
        if (data) {
            data = ((Object.keys(data.data).length == 1) || !data.error) ? data.data : null

            const cache_data = window.localStorage.getItem("map_data");
            // 當無緩存資料或有最新資料時，儲存至local
            if ((cache_data === null) || (cache_data !== JSON.stringify(data))) {
                const location_time = new Date().toLocaleString('zh-Hant-TW');
                console.log(`${location_time}: 壅塞資料已更新! (每60秒)`);

                window.localStorage.setItem("map_data", JSON.stringify(data));
            }

            // 當資料無效時或緩存資料存在時則使用緩存資料
            if ((data === null) || (window.localStorage.getItem("map_data") !== null)) {
                setMapData(JSON.parse(window.localStorage.getItem("map_data")))
            } else {
                setMapData(data)
            }
        } else {
            setMapData(JSON.parse(window.localStorage.getItem("map_data")))
        }
    }, [data]);


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

    // 點擊路段傳遞資訊給側邊欄
    const onClick = useCallback((info, event) => {
        let section_info = info?.object?.properties
        if (section_info) {
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

    // 搜尋路段前往座標點
    useEffect(() => {

    }, [search]);

    return (
        <div className="grid h-full w-full">
            {/* 地圖視覺化 */}
            <DeckGL
                layers={Layer_GeoJson(!MapData?.error ? MapData : null)} // 自訂的視覺化圖層(GeoJson)
                effects={[lightingEffect]}
                initialViewState={initialViewState}
                controller={true}
                getTooltip={getTooltip}
                style={{ width: '100%', height: '100%', fontWeight: 'bold', fontSize: '16px' }}
                onClick={onClick}
                touchAction='unset'
            >
                {/* 以MapBox地圖為基底 */}
                <Map
                    className=""
                    controller={true}
                    mapboxAccessToken={mapbox_api_key}
                    mapStyle="mapbox://styles/retex/clybowush00n301pr4vuz4fbf"
                    onRender={(event) => event.target.resize()}
                >
                    <Marker
                        longitude={location ? location.longitude : initialViewState.longitude}
                        latitude={location ? location.latitude : initialViewState.latitude}
                        color="red"
                    />
                </Map>
            </DeckGL>
            {/* 搜尋輸入框 */}
            <div className='fixed right-2 mt-2 flex flex-col md:flex-row flex-wrap md:flex-nowrap flex-auto justify-end items-end md:items-center right-1 w-auto sm:max-w-lg md:max-w-md lg:max-w-md'>
                {
                    <div className={`relative md:mr-2 mt-2`}>
                        <FloatingLabel variant="filled" label="搜尋路段..." sizing="md" value={search} onChange={e => setSearch(e.target.value)}
                            className={`flex rounded rounded-lg h-auto select-none cursor-text text-xl ${searchSection ? "opacity-100 w-72" : "opacity-0 w-0"} transition-all ease-in-out duration-200`}
                        />
                    </div>
                }
                {<Button type="button" color="cyan" className="flex select-none order-first md:order-none font-bold items-center border-[2px] border-gray-800 h-fit w-fit z-[9998]" onClick={() => setSearchSection(!searchSection)}>
                    <div className="flex flex-col justify-center items-center p-0 m-0" >
                        <TbMapSearch className='h-5 w-5' />
                        <span className="hidden sm:block"> 搜尋路段 </span>
                    </div>
                </Button>}
            </div>
            {
                // 壅塞資訊側邊欄
                <Info_Component
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
                    icon_text={"系統訊息"}
                    title={"系統訊息"}
                    contents={warn}
                />
            }
            {
                (!warn && error) &&
                <Toast_Component
                    icon_text={"系統訊息"}
                    title={"警告訊息"} // error.status
                    contents={Array.isArray(error.info) ? error.info : JSON.stringify(error.info, null, 1)}
                />
            }
            {
                (!data && !error && !warn) &&
                <Toast_Component
                    icon_text={"系統訊息"}
                    title={"系統訊息"}
                    contents={`正在載入 ${(selectedTime?.[0] == 0) ? '最新即時' : Math.abs(selectedTime?.[0] / 24) + ((selectedTime?.[0] < 0) ? '天前' : '天後')} 之資料`}
                />
            }
        </div>
    )
}

export default LocationAggregatorMap;