'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Button, FloatingLabel } from "flowbite-react";
import { TbMapSearch } from "react-icons/tb";
import { MdGpsFixed } from "react-icons/md";
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
import { useENV, useTime, useDrawer } from "@/context";
//import { Client } from "@googlemaps/google-maps-services-js";


Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}


const LocationAggregatorMap = ({ off, useExistToken }) => {
    // 取得環境變數
    const { ENVConfig, SetENVConfig } = useENV();
    // 取得時間軸指定日期
    const { selectedTime } = useTime();
    // 取得開啟壅塞詳細側邊欄狀態
    const { showDrawer, setShowDrawer } = useDrawer();

    // 儲存使用者經緯度
    const [location, setLocation] = useState();

    // 儲存觀看座標、縮放等資訊
    const [initialViewState, setInitialViewState] = useState(INITIAL_VIEW_STATE.SF);

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
    const [searchResult, setSearchResult] = useState([]);

    // 儲存動畫過渡狀態
    //const [isTransition, setIsTransition] = useState(false);

    const [messages, setMessages] = useState("");

    if (ENVConfig) {
        // 取得MapBox金鑰
        var mapbox_api_key = ENVConfig.mapbox.token;
        var mapbox_style = ENVConfig.mapbox.style;

        // 取得 Polstar北宸科技地圖服務 API 金鑰
        var polstar_api_key = ENVConfig.polstar.key;
    }


    // 更新初始座標起始點(如果已儲存使用者位置)
    useEffect(() => {
        const UserLocation = JSON.parse(window.localStorage.getItem("UserLocation"));

        if (UserLocation) {
            setInitialViewState(UserLocation)

            INITIAL_VIEW_STATE.SF = UserLocation
        }
    }, [])

    // 取得使用者經緯度 [使用者同意取得位置權限時]
    const getCurrentPosition = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                const { latitude, longitude } = coords;

                setLocation({ latitude, longitude });
                INITIAL_VIEW_STATE.NYC.latitude = latitude;
                INITIAL_VIEW_STATE.NYC.longitude = longitude;

                // 儲存至LocalStorage
                window.localStorage.setItem("UserLocation", JSON.stringify(INITIAL_VIEW_STATE.NYC))
            })
        } else {
            setLocation(INITIAL_VIEW_STATE.SF);
        }
    }

    useEffect(() => {
        getCurrentPosition()
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
            //console.log(data.data?.features[0]?.properties?.update_time)
            const Data = ((Object.keys(data.data).length == 1) || !data.error) ? data.data : null

            // 取得緩存在localStorage的壅塞資料
            const cache_data = window.localStorage.getItem("map_data");

            // 當無緩存資料或有最新資料時，儲存至local
            const cache_data_time = new Date(JSON.parse(cache_data)?.features[0]?.properties?.update_time).addHours(-8)
            const now_time = new Date().getTime()
            if ((cache_data === null) || (cache_data !== JSON.stringify(Data) || (cache_data_time < now_time))) {
                const location_time = new Date().toLocaleString('zh-Hant-TW');
                console.log(`${location_time}: 壅塞資料已更新! (每60秒)`);

                window.localStorage.setItem("map_data", JSON.stringify(Data));
            }

            // 當資料無效時或緩存資料存在時則使用緩存資料
            if ((Data === null) || (window.localStorage.getItem("map_data") !== null)) {
                setMapData(JSON.parse(window.localStorage.getItem("map_data")))
            } else {
                setMapData(Data)
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

    // 包裝 Update_info_component 在 useCallback 中
    const Update_info_component = useCallback((info, section_info) => {
        setCoordinate(info?.coordinate)
        setColor(section_info?.color)
        setDescribe(section_info?.describe)
        setId(section_info?.id)
        setName(section_info?.name)
        setTravel_speed(section_info?.travel_speed)
        setTravel_time(section_info?.travel_time)
        setUpdate_interval(section_info?.update_interval)
        setUpdate_time(section_info?.update_time)
        setShowDrawer(true)
    }, [setShowDrawer]); // 加入 setShowDrawer 作為相依性

    // 點擊路段傳遞資訊給側邊欄
    const onClick = useCallback((info, event) => {
        let section_info = info?.object?.properties
        if (section_info) {
            Update_info_component(info, section_info)
        }
    }, [Update_info_component]);

    // 搜尋路段結果範例
    /*
    search_result_example = {
        "results": [
            {
                "address_components": [
                    {
                        "long_name": "34號",
                        "short_name": "34號",
                        "types": [
                            "street_number"
                        ]
                    },
                    {
                        "long_name": "302082",
                        "short_name": "302082",
                        "types": [
                            "postal_code"
                        ]
                    }
                ],
                "adr_address": "<span class=\"postal-code\">302082</span><span class=\"country-name\">台灣</span><span class=\"region\">新竹縣</span><span class=\"locality\">竹北市</span><span class=\"street-address\">竹北里台元街34號</span>",
                "formatted_address": "302082台灣新竹縣竹北市竹北里台元街34號",
                "place_id": "PO670",
                "reference": "PO670",
                "name": "OK便利超商台元第一門市",
                "geometry": {
                    "location": {
                        "lat": 24.842673,
                        "lng": 121.016252
                    },
                    "location_type": "ROOFTOP",
                    "viewport": {
                        "northeast": {
                            "lat": 24.842673,
                            "lng": 121.016252
                        },
                        "southwest": {
                            "lat": 24.842673,
                            "lng": 121.016252
                        }
                    }
                },
                "phone_number": "03-6106496",
                "scope": "POLSTAR",
                "types": [
                    "convenience_store",
                    "store",
                    "food",
                    "point_of_interest",
                    "establishment"
                ],
                "vicinity": "新竹縣竹北市台元街34號",
                "entrancepoint": {
                    "lat": 24.842673,
                    "lng": 121.016252
                }
            },
            {
                "address_components": [
                    {
                        "long_name": "2樓",
                        "short_name": "2樓",
                        "types": [
                            "subpremise"
                        ]
                    },
                    {
                        "long_name": "59號",
                        "short_name": "59號",
                        "types": [
                            "street_number"
                        ]
                    },
                    {
                        "long_name": "和平街",
                        "short_name": "和平街",
                        "types": [
                            "route"
                        ]
                    },
                    {
                        "long_name": "福德里",
                        "short_name": "福德里",
                        "types": [
                            "administrative_area_level_4",
                            "political"
                        ]
                    },
                    {
                        "long_name": "竹北市",
                        "short_name": "竹北市",
                        "types": [
                            "administrative_area_level_3",
                            "political"
                        ]
                    },
                    {
                        "long_name": "新竹縣",
                        "short_name": "新竹縣",
                        "types": [
                            "administrative_area_level_2",
                            "political"
                        ]
                    },
                    {
                        "long_name": "台灣",
                        "short_name": "TW",
                        "types": [
                            "country",
                            "political"
                        ]
                    },
                    {
                        "long_name": "302045",
                        "short_name": "302045",
                        "types": [
                            "postal_code"
                        ]
                    }
                ],
                "adr_address": "<span class=\"postal-code\">302045</span><span class=\"country-name\">台灣</span><span class=\"region\">新竹縣</span><span class=\"locality\">竹北市</span><span class=\"street-address\">福德里和平街59號</span>",
                "formatted_address": "302045台灣新竹縣竹北市福德里和平街59號 2樓",
                "place_id": "PO93666",
                "reference": "PO93666",
                "name": "OK便利超商竹北台鐵門市",
                "geometry": {
                    "location": {
                        "lat": 24.839157,
                        "lng": 121.009441
                    },
                    "location_type": "ROOFTOP",
                    "viewport": {
                        "northeast": {
                            "lat": 24.839157,
                            "lng": 121.009441
                        },
                        "southwest": {
                            "lat": 24.839157,
                            "lng": 121.009441
                        }
                    }
                },
                "phone_number": "03-6105089",
                "scope": "POLSTAR",
                "types": [
                    "convenience_store",
                    "store",
                    "food",
                    "point_of_interest",
                    "establishment"
                ],
                "vicinity": "新竹縣竹北市和平街59號 2樓",
                "entrancepoint": {
                    "lat": 24.839157,
                    "lng": 121.009441
                }
            },
            {
                "address_components": [
                    {
                        "long_name": "1樓",
                        "short_name": "1樓",
                        "types": [
                            "subpremise"
                        ]
                    },
                    {
                        "long_name": "3號",
                        "short_name": "3號",
                        "types": [
                            "street_number"
                        ]
                    },
                    {
                        "long_name": "台元一街",
                        "short_name": "台元一街",
                        "types": [
                            "route"
                        ]
                    },
                    {
                        "long_name": "竹北里",
                        "short_name": "竹北里",
                        "types": [
                            "administrative_area_level_4",
                            "political"
                        ]
                    },
                    {
                        "long_name": "竹北市",
                        "short_name": "竹北市",
                        "types": [
                            "administrative_area_level_3",
                            "political"
                        ]
                    },
                    {
                        "long_name": "新竹縣",
                        "short_name": "新竹縣",
                        "types": [
                            "administrative_area_level_2",
                            "political"
                        ]
                    },
                    {
                        "long_name": "台灣",
                        "short_name": "TW",
                        "types": [
                            "country",
                            "political"
                        ]
                    },
                    {
                        "long_name": "302082",
                        "short_name": "302082",
                        "types": [
                            "postal_code"
                        ]
                    }
                ],
                "adr_address": "<span class=\"postal-code\">302082</span><span class=\"country-name\">台灣</span><span class=\"region\">新竹縣</span><span class=\"locality\">竹北市</span><span class=\"street-address\">竹北里台元一街3號</span>",
                "formatted_address": "302082台灣新竹縣竹北市竹北里台元一街3號 1樓",
                "place_id": "PO510043",
                "reference": "PO510043",
                "name": "OK便利超商台元第二門市",
                "geometry": {
                    "location": {
                        "lat": 24.841156,
                        "lng": 121.018787
                    },
                    "location_type": "ROOFTOP",
                    "viewport": {
                        "northeast": {
                            "lat": 24.841156,
                            "lng": 121.018787
                        },
                        "southwest": {
                            "lat": 24.841156,
                            "lng": 121.018787
                        }
                    }
                },
                "phone_number": "03-6107183",
                "scope": "POLSTAR",
                "types": [
                    "convenience_store",
                    "store",
                    "food",
                    "point_of_interest",
                    "establishment"
                ],
                "vicinity": "新竹縣竹北市台元一街3號 1樓",
                "entrancepoint": {
                    "lat": 24.841156,
                    "lng": 121.018787
                }
            },
            {
                "address_components": [
                    {
                        "long_name": "1號",
                        "short_name": "1號",
                        "types": [
                            "street_number"
                        ]
                    },
                    {
                        "long_name": "四維路",
                        "short_name": "四維路",
                        "types": [
                            "route"
                        ]
                    },
                    {
                        "long_name": "勝利村",
                        "short_name": "勝利村",
                        "types": [
                            "administrative_area_level_4",
                            "political"
                        ]
                    },
                    {
                        "long_name": "湖口鄉",
                        "short_name": "湖口鄉",
                        "types": [
                            "administrative_area_level_3",
                            "political"
                        ]
                    },
                    {
                        "long_name": "新竹縣",
                        "short_name": "新竹縣",
                        "types": [
                            "administrative_area_level_2",
                            "political"
                        ]
                    },
                    {
                        "long_name": "台灣",
                        "short_name": "TW",
                        "types": [
                            "country",
                            "political"
                        ]
                    },
                    {
                        "long_name": "303036",
                        "short_name": "303036",
                        "types": [
                            "postal_code"
                        ]
                    }
                ],
                "adr_address": "<span class=\"postal-code\">303036</span><span class=\"country-name\">台灣</span><span class=\"region\">新竹縣</span><span class=\"locality\">湖口鄉</span><span class=\"street-address\">勝利村四維路1號</span>",
                "formatted_address": "303036台灣新竹縣湖口鄉勝利村四維路1號",
                "place_id": "PO546636",
                "reference": "PO546636",
                "name": "OK便利超商矽格湖口門市",
                "geometry": {
                    "location": {
                        "lat": 24.864291,
                        "lng": 121.023686
                    },
                    "location_type": "ROOFTOP",
                    "viewport": {
                        "northeast": {
                            "lat": 24.864291,
                            "lng": 121.023686
                        },
                        "southwest": {
                            "lat": 24.864291,
                            "lng": 121.023686
                        }
                    }
                },
                "phone_number": "03-6106375",
                "scope": "POLSTAR",
                "types": [
                    "convenience_store",
                    "store",
                    "food",
                    "point_of_interest",
                    "establishment"
                ],
                "vicinity": "新竹縣湖口鄉四維路1號",
                "entrancepoint": {
                    "lat": 24.864291,
                    "lng": 121.023686
                }
            }
        ],
        "status": "OK",
        "network_version_check_code": "43ee9ce32d5b77a41e9c9e107b649192",
        "poi_version_check_code": "a8cada1d9819f37ab1976dbe009bd890"
    }
    */

    // 搜尋路段
    useEffect(() => {
        async function getLocation() {
            const prams_config = {
                key: polstar_api_key,
                locationBias: `point:${initialViewState.latitude},${initialViewState.longitude}`,
                input: search,
                inputType: 'textquery'
            }

            // 搜尋路段API URL (北宸導航 API)
            const api_url = 'https://mapi.polstarapis.com/maps/api/place/findplacefromtext/json?' + new URLSearchParams(prams_config).toString()

            await fetch(api_url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then((res) => {
                return res.json()
            }).then((data) => {
                if (data.status === "OK") {
                    const search_result = data.candidates.map((result) => {
                        return [
                            `${result.name} ( ${result.formatted_address} )`,
                            {
                                longitude: result.geometry.location.lng,
                                latitude: result.geometry.location.lat
                            }
                        ]
                    })
                    setSearchResult(search_result)
                    //console.log(search_result)
                }
            }).catch((error) => {
                console.log(error)
            })
        }
        setTimeout(() => {
            getLocation()
        }, 1000);
    }, [search, initialViewState]);

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
                    mapStyle={mapbox_style}
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
            <div className='fixed right-2 mt-2 flex flex-col md:flex-row flex-wrap md:flex-nowrap flex-auto justify-end items-end md:items-center w-auto sm:max-w-lg md:max-w-md lg:max-w-md'>
                <div
                    className={`relative flex flex-col md:flex-row flex-wrap md:flex-nowrap flex-auto justify-end items-end md:items-center w-auto sm:max-w-lg md:max-w-md lg:max-w-md`}
                >
                    {/* 搜尋路段 */}
                    <div className={`relative md:mr-2 mt-2`}>
                        <FloatingLabel variant="filled" label="搜尋路段..." sizing="md" value={search} onChange={e => setSearch(e.target.value)}
                            className={`flex rounded-lg h-auto select-none cursor-text text-xl ${searchSection ? "opacity-100 w-80" : "opacity-0 w-0"} transition-all ease-in-out duration-200`}
                        />
                    </div>
                    {
                        // 搜尋結果框
                        (searchResult.length > 0) && (
                            <div className={`absolute overflow-clip top-16 mt-2 w-full border-[3px] border-gray-500 rounded-lg ${searchSection ? "opacity-100 w-72" : "opacity-0 w-0 hidden"} transition-all ease-in-out duration-100`}>
                                <div
                                    className={`flex flex-col md:flex-row h-[55vh] w-full flex-wrap md:flex-nowrap flex-auto overflow-y-scroll justify-canter items-start sm:max-w-lg md:max-w-md lg:max-w-md dark:bg-gray-800 dark:text-gray-200 bg-gray-200 text-gray-800`}
                                >
                                    <ul
                                        className={`flex flex-col space-y-2 m-1 w-full h-auto select-none cursor-pointer text-xl`}
                                    >
                                        {
                                            searchResult.map((result, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => {
                                                        // 前往目的地過渡動畫
                                                        setInitialViewState({
                                                            longitude: result[1].longitude,
                                                            latitude: result[1].latitude,
                                                            zoom: 17,
                                                            transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
                                                            transitionDuration: 'auto',
                                                        });
                                                        setTimeout(() => {
                                                            Update_info_component({ coordinate: [result[1].longitude, result[1].latitude] }, { name: result[0] })
                                                        }, 2000)
                                                        //setSearch('');
                                                        //setSearchSection(false);
                                                    }}
                                                    className={`flex flex-col justify-center items-start p-1 m-0 border-b-[2px] dark:border-gray-200 border-gray-800 hover:text-blue-600 transition-all ease-in-out duration-200`}
                                                >
                                                    {result[0]}
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            </div>
                        )
                    }
                </div>
                {
                    <Button type="button" color="cyan" className="flex select-none order-first md:order-none font-bold items-center border-[2px] border-gray-800 h-fit w-fit z-[9998]" onClick={() => setSearchSection(!searchSection)}>
                        <div className="flex flex-col justify-center items-center p-0 m-0" >
                            <TbMapSearch className='h-5 w-5' />
                            <span className="hidden sm:block"> 搜尋路段 </span>
                        </div>
                    </Button>
                }
            </div>
            {/* 定位目前位置 */}
            <div
                className={`fixed right-7 bottom-40 flex flex-col md:flex-row flex-wrap md:flex-nowrap flex-auto justify-end items-end md:items-center w-auto sm:max-w-lg md:max-w-md lg:max-w-md`}
            >
                <Button
                    type="button"
                    color="blue"
                    className={`flex select-none order-first md:order-none font-bold items-center border-[2px] border-gray-800 h-fit w-fit z-[9998]`}
                    onClick={() => {
                        if (location) {
                            //getCurrentPosition();
                            setInitialViewState({
                                longitude: location?.longitude,
                                latitude: location?.latitude,
                                zoom: 18,
                                transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
                                transitionDuration: 'auto',
                            });
                        } else {
                            setMessages("尚未啟用位置權限")
                            setTimeout(() => {
                                setMessages(null)
                            }, 1500)
                        }
                    }}
                >
                    <div className="flex flex-col justify-center items-center p-0 m-0" >
                        <MdGpsFixed className='h-4 w-4' />
                    </div>
                </Button>
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
                messages &&
                <Toast_Component
                    icon_text={"系統訊息"}
                    title={"系統訊息"}
                    contents={messages}
                    showExit={false}
                />
            }
            {
                warn &&
                <Toast_Component
                    icon_text={"系統訊息"}
                    title={"系統訊息"}
                    contents={warn.info}
                />
            }
            {
                (!warn && error) &&
                <Toast_Component
                    icon_text={"系統訊息"}
                    title={"警告訊息"} // error.status
                    contents={Array.isArray(error.info) ? JSON.stringify(error.info, null, 1) : error.info}
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