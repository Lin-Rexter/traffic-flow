"use client";
import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import { useGetTraffic } from "@/hooks/useGetTraffic";


// 動態載入地圖
const Dynamic_LocationAggregatorMap = dynamic(
    () => import("./map"),
    {
        ssr: true,
        loading: () => {
            console.log("地圖介面載入中...")
            return (
                <div className="flex h-full">
                    <div className="inline-flex m-auto items-center px-4 py-2 font-semibold leading-6 text-md shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed">
                        <svg className="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        地圖加載中...
                    </div>
                </div>
            )
        },
    }
);

// 動態載入時間軸
const DynamicTimeline = dynamic(
    () => import("./timeline"),
    {
        ssr: true,
    }
);

// 動態載入聊天室
const DynamicChatBubble = dynamic(
    () => import('./chat'),
    {
        ssr: true,
        /*loading: () => {
            console.log("聊天介面載入中...")
            return (
                <div className="flex h-screen">
                    <div className="inline-flex m-auto items-center px-4 py-2 font-semibold leading-6 text-md shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        地圖加載中...
                    </div>
                </div>
            )
        },*/
    }
);


// 取得即時壅塞資料
const Map = ({ off = false, getToken = false }) => {
    const [data, error, warn] = useGetTraffic(off, getToken)

    if (off) {
        return (<Dynamic_LocationAggregatorMap data={null} />)
    } else {
        if (warn) {
            //console.log("AAAAAAAAAA", warn)
            return (<Dynamic_LocationAggregatorMap warn={warn} />)
        }

        if (error) {
            //console.log("BBBBBBBBBB", error)
            return (<Dynamic_LocationAggregatorMap error={error} />)
        }

        if (data) {
            //console.log("CCCCCCCCCC", Object.keys(data.data).length)
            const now = new Date();
            const location_time = now.toLocaleString();
            console.log(`${location_time}: 壅塞資料已更新! (每60秒)`);

            return (<Dynamic_LocationAggregatorMap data={((Object.keys(data.data).length == 1) || !data.error) ? data.data : null} />)
        }
    }
}


const HomePage = () => {
    return (
        <div className="grid grid-flow-row-dense grid-rows-1 auto-rows-auto h-screen items-center justify-center m-auto">
            {/*!data && !error && (
                    <div className="flex h-screen">
                        <div className="inline-flex m-auto items-center px-4 py-2 font-semibold leading-6 text-md shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed">
                            <svg className="animate-spin ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            地圖加載中...
                        </div>
                    </div>
                )*/}
            <Suspense fallback={(
                <div className="flex h-auto">
                    <div className="inline-flex m-auto items-center px-4 py-2 font-semibold leading-6 text-md shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed">
                        <svg className="animate-spin ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        地圖加載中...
                    </div>
                </div>
            )}>
                {<Map off={false} getToken={false} /> || <Skeleton />}
            </Suspense>

            <div className="fixed bottom-28 left-12 w-[976px]">
                {<DynamicTimeline /> || <Skeleton count={5} />}
            </div>

            <div className="fixed bottom-20 right-4 w-auto">
                {<DynamicChatBubble /> || <Skeleton count={5} />}
            </div>
        </div>
    );
}

export default HomePage;