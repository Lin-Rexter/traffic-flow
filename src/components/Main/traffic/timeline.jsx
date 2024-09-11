"use client";
import React, { useContext, useState, useRef, useEffect, useCallback } from "react";
import { Button, Popover } from "flowbite-react";
import { useTime } from "@/context";
import { GetTDXDate } from '@/lib/tdx/all_date'
import { DiffDays } from '@/lib/utils'


const Content = (past_day, date) => {
    return (
        <div className="w-48 text-sm text-gray-500 dark:text-gray-400">
            <div className="border-b border-gray-200 bg-gray-100 text-center px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">{past_day}</h3>
            </div>
            <div className="px-3 py-2 justify-center text-center">
                <p>{date}</p>
            </div>
        </div>
    )
}

var time_len = 0
const Timeline = () => {
    const { selectedTime, setSelectedTime } = useTime();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const timelineRef = useRef(null);

    /* Example:
    const timeMarkers = [
        { label: "7天前", value: -7 * 24 },
        { label: "6天前", value: -6 * 24 },
        { label: "5天前", value: -5 * 24 },
        { label: "4天前", value: -4 * 24 },
        { label: "3天前", value: -3 * 24 },
        { label: "2天前", value: -2 * 24 },
        { label: "即時", value: 0 },
        { label: "1小時", value: 1 },
        { label: "3小時", value: 3 },
        { label: "6小時", value: 6 },
        { label: "12小時", value: 12 },
        { label: "1天", value: 24 },
    ];
    */

    // 時間刻度
    var timeMarkers = [
        { label: "即時", value: 0 }
    ]

    // 初始時間軸控制鈕定位到即時刻度
    useEffect(() => {
        // 置中
        if (timeMarkers.length > time_len) {
            time_len = timeMarkers.length
            setSelectedIndex(() => {
                const RealTimeIndex = Object.keys(timeMarkers).filter(function (key) {
                    return timeMarkers[key].value == 0
                })
                return Number(RealTimeIndex)
            })
        }else{
            time_len = 0
        }
    }, [time_len])

    // 新增時間軸刻度
    var dayNames = ["日", "一", "二", "三", "四", "五", "六"]
    const [Forecast_Date_list, His_Date_list] = GetTDXDate().data;
    if (Forecast_Date_list?.length > 0 && His_Date_list?.length > 0) {
        const his_timeList = His_Date_list.sort().reverse()
        const forecast_timeList = Forecast_Date_list.sort()

        // 新增壅塞天數
        Object.values([...his_timeList, ...forecast_timeList]).forEach((item, index) => {
            let diffDays = DiffDays(new Date(item), new Date())
            if ((Math.abs(diffDays) == 0) || (Math.abs(diffDays) > 365)) return;

            const item_date = new Date(item).toLocaleString('zh-Hant-TW') + ' ' + `(禮拜${dayNames[new Date(item).getDay()]})`

            // 小於0表示預測資料天數
            if (diffDays < 0) {
                diffDays = Math.abs(diffDays)
                timeMarkers.push({ label: `${diffDays}天後`, value: (diffDays * 24), date: item_date })
            } else if (diffDays > 0) {
                timeMarkers.unshift({ label: `${diffDays}天前`, value: -(diffDays * 24), date: item_date })
            }
        })
    }

    // 取得時間軸所選擇的時間
    useEffect(() => {
        setSelectedTime(timeMarkers[selectedIndex].value);
    }, [selectedIndex, setSelectedTime]);

    // 取得時間軸所選擇的Index
    const updateTimelinePosition = (clientX) => {
        const timeline = timelineRef.current;
        const rect = timeline.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newIndex = Math.round(percentage * (timeMarkers.length - 1));
        setSelectedIndex(newIndex);
    };

    // 滑鼠按下事件
    const handleMouseDown = (e) => {
        setIsDragging(true);
        updateTimelinePosition(e.clientX);
    };

    // 滑鼠移動事件
    const handleMouseMove = (e) => {
        if (isDragging) {
            updateTimelinePosition(e.clientX);
        }
    };

    // 滑鼠放開事件
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // 當滑鼠按下時，綁定相關滑鼠動作事件
    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (((Forecast_Date_list?.length > 0) && (His_Date_list?.length > 0)) && (
        <div className="w-2/3 max-w-2xl">
            <div className="relative h-4 bg-blue-200 rounded-full cursor-pointer select-none"
                ref={timelineRef}
                onMouseDown={handleMouseDown}>
                {/* 藍色進度條 */}
                <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                    style={{ width: `${(selectedIndex / (timeMarkers.length - 1)) * 100}%` }} />

                {/* 時間標記 */}
                {timeMarkers.map((marker, index) => (
                    <div key={index}
                        className="absolute top-7 transform -translate-x-1/2 text-xs text-white"
                        style={{ left: `${(index / (timeMarkers.length - 1)) * 100}%`, whiteSpace: 'nowrap' }}>
                        {marker.label}
                    </div>
                ))}

                {/* 控制鈕 */}
                <Popover
                    content={
                        Content(
                            timeMarkers[selectedIndex].label,
                            (timeMarkers[selectedIndex].date || new Date().toLocaleString('zh-Hant-TW') + ' ' + `(禮拜${dayNames[new Date().getDay()]})`)
                        )
                    }
                    trigger="hover"
                    placement="top"
                >
                    <div
                        className="absolute top-[-5] w-7 h-7 bg-white rounded-full"
                        style={{ left: `calc(${(selectedIndex / (timeMarkers.length - 1)) * 100}% - 2%)` }}
                    />
                </Popover>
            </div>
        </div>
    )
    )
};

export default Timeline;
