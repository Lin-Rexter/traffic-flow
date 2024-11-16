"use client";
import React, { useContext, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import { TimeProvider, DrawerProvider } from "@/context";


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


const HomePage = () => {
    return (
        <TimeProvider>
            <DrawerProvider>
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
                    {/* 互動式壅塞地圖 */}
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
                        {<Dynamic_LocationAggregatorMap off={false} useExistToken={false} /> || <Skeleton />}
                    </Suspense>

                    {/* 時間軸 */}
                    <div className="fixed bottom-28 md:left-8 w-full md:w-2/3 md:max-w-2xl px-6 md:mx-0">
                        {<DynamicTimeline /> || <Skeleton count={5} />}
                    </div>

                    {/* AI助手 */}
                    <div className="fixed bottom-[140px] md:bottom-24 right-4 w-auto">
                        {<DynamicChatBubble /> || <Skeleton count={5} />}
                    </div>
                </div>
            </DrawerProvider>
        </TimeProvider>
    );
}

export default HomePage;