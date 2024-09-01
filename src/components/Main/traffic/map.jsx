'use client'
//import React, { useState } from 'react';
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


// 取得MapBox金鑰
const mapbox_api_key = process.env.NEXT_PUBLIC_MAPBOX_TOKENS;


var last_data = null
// 設置視覺化地圖內容
const LocationAggregatorMap = ({ data, error, warn }) => {

    if (data) {
        last_data = data
    }
    //console.log(last_data)

    // 建立提示框(tooltip)
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
    更新週期: ${object.properties.update_interval}秒
    `;
    }

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
            {error && (
                <Toast>
                    <div className="fixed top-24 right-4 z-[9999] max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800">
                        <div className="flex items-start">
                            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-900 dark:text-cyan-300">
                                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.147 15.085a7.159 7.159 0 0 1-6.189 3.307A6.713 6.713 0 0 1 3.1 15.444c-2.679-4.513.287-8.737.888-9.548A4.373 4.373 0 0 0 5 1.608c1.287.953 6.445 3.218 5.537 10.5 1.5-1.122 2.706-3.01 2.853-6.14 1.433 1.049 3.993 5.395 1.757 9.117Z" />
                                </svg>
                                <span className="sr-only">錯誤訊息</span>
                            </div>
                            <div className="ml-3 text-sm font-normal">
                                <div className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
                                    <p>錯誤訊息 (狀態碼: {JSON.stringify(error.status)})</p>
                                </div>
                                <div className="mb-1 text-sm font-normal">
                                    <p>{JSON.stringify(error.info)}</p>
                                    <p>{JSON.stringify(error.error_data)}</p>
                                </div>
                            </div>
                            <Toast.Toggle />
                        </div>
                    </div>
                </Toast>
            )}
            {warn && (
                <div className="flex m-auto">
                    <div id="toast-default" className="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-800 dark:text-blue-200">
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.147 15.085a7.159 7.159 0 0 1-6.189 3.307A6.713 6.713 0 0 1 3.1 15.444c-2.679-4.513.287-8.737.888-9.548A4.373 4.373 0 0 0 5 1.608c1.287.953 6.445 3.218 5.537 10.5 1.5-1.122 2.706-3.01 2.853-6.14 1.433 1.049 3.993 5.395 1.757 9.117Z" />
                            </svg>
                            <span className="sr-only">服務狀態</span>
                        </div>
                        <div className="ms-3 text-sm font-normal">
                            <p>{warn}</p>
                        </div>
                        <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-default" aria-label="Close">
                            <span className="sr-only">關閉</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LocationAggregatorMap;