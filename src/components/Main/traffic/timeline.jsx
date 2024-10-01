"use client";
import React, { useContext, useState, useRef, useEffect, useCallback } from "react";
import { Button, Popover, Dropdown } from "flowbite-react";
import {
    TbSquareRoundedNumber1Filled,
    TbSquareRoundedNumber2Filled,
    TbSquareRoundedNumber3Filled,
    TbSquareRoundedNumber4Filled,
    TbSquareRoundedNumber5Filled,
    TbSquareRoundedNumber6Filled,
    TbSquareRoundedNumber7Filled,
} from "react-icons/tb";
import { SiFuturelearn } from "react-icons/si"
import { FaHistory, FaFireAlt } from "react-icons/fa";;
import { useTime } from "@/context";
import { GetTDXDate } from '@/lib/tdx/all_date'
import { DiffDays } from '@/lib/utils'



Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

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
    const [filterTimeList, setFilterTimeList] = useState([]); // 儲存篩選後的時間列表

    const [isShowFuture, setIsShowFuture] = useState(false);
    const [isShowHistory, setIsShowHistory] = useState(false);
    const [isShowRealtime, setIsShowRealtime] = useState(false);

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
        } else {
            time_len = timeMarkers.length
        }
    }, [time_len, timeMarkers])

    // 新增時間軸刻度
    var dayNames = ["日", "一", "二", "三", "四", "五", "六"]

    var [Forecast_Date_list, Hx_Date_list] = GetTDXDate()?.data;
    if ((Forecast_Date_list?.length > 0) && (Hx_Date_list?.length > 0)) {
        // 排序時間
        let Hx_timeList = Hx_Date_list.sort((a, b) => a.getTime() - b.getTime()).reverse()
        let forecast_timeList = Forecast_Date_list.sort((a, b) => a.getTime() - b.getTime())

        // 檢查預測資料是否過期(小於現在時間)
        forecast_timeList = forecast_timeList.filter((item_date) => DiffDays(item_date, new Date()) < 0)

        //console.log("長度:", Forecast_Date_list?.length)
        //console.log("長度: ", Hx_Date_list?.length)

        // 要新增的天數列表
        var timeList = [...Hx_timeList, ...forecast_timeList]

        // 新增壅塞天數
        Object.values(timeList).forEach((item, index) => {
            let diffDays = DiffDays(item, new Date())
            if ((Math.abs(diffDays) == 0) || (Math.abs(diffDays) > 365)) return;
            // 一天只新增中午12點的資料
            //if (item.getHours() != 12) return;

            const item_date = new Date(item).toLocaleString('zh-Hant-TW') + ' ' + `(禮拜${dayNames[new Date(item).getDay()]})`
            const item_dates = new Date(item).addHours(0).toISOString()
            // 小於0表示預測資料天數
            if (diffDays < 0) {
                diffDays = Math.abs(diffDays)
                timeMarkers.push({ label: `${diffDays}天後`, value: (diffDays * 24), date: item_date, dates: item_dates })
            } else if (diffDays > 0) {
                timeMarkers.unshift({ label: `${diffDays}天前`, value: -(diffDays * 24), date: item_date, dates: item_dates })
            }
        })
    }

    // 取得時間軸所選擇的時間
    useEffect(() => {
        setSelectedTime([timeMarkers[selectedIndex].value, timeMarkers[selectedIndex].dates]);
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

    // 取得選擇的禮拜幾
    const getButtonDay = (e) => {
        // 初始化filterTimeList
        setFilterTimeList([])

        const dayToNumber = {
            "一": 1,
            "二": 2,
            "三": 3,
            "四": 4,
            "五": 5,
            "六": 6,
            "日": 7
        }
        let selectedDay = dayToNumber[e.target.innerText.slice(2)]

        setFilterTimeList(
            timeMarkers.filter((item) => new Date(item.dates).getDay() === selectedDay)
        )
    };

    // 點擊歷史時間按鈕
    const history_button = () => {
        setIsShowHistory(!isShowHistory);
    }

    // 點擊即時時間按鈕
    const realtime_button = () => {
        // 初始化filterTimeList
        setFilterTimeList([])

        setIsShowRealtime(!isShowRealtime);

        // 跳至即時資料
        setSelectedIndex(() => {
            const RealTimeIndex = Object.keys(timeMarkers).filter(function (key) {
                return timeMarkers[key].value == 0
            })
            return Number(RealTimeIndex)
        })
    }

    // 點擊未來時間按鈕
    const future_button = () => {
        // 初始化filterTimeList
        setFilterTimeList([])

        setIsShowFuture(!isShowFuture);
        setFilterTimeList(timeMarkers.filter((item) => item.value > 0))
        setSelectedIndex(0);
    }


    var day_icon = [
        <TbSquareRoundedNumber1Filled className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber2Filled className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber3Filled className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber4Filled className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber5Filled className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber6Filled className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber7Filled className="h-5 w-5" color="dark" />
    ]

    if (filterTimeList?.length > 0) {
        console.log(filterTimeList)
        timeMarkers = filterTimeList
    }
    return (((Forecast_Date_list?.length > 0) && (Hx_Date_list?.length > 0)) && (
        <div className="w-2/3 max-w-2xl">
            <div className="relative rounded-full mb-2">
                <form className="grid w-fit">
                    {//isShowHistory &&
                        (<div className={`grid bg-gray-300 border-[2px] border-gray-100 grid-cols-auto sm:grid-cols-7 mb-2 rounded-lg gap-1 w-max ${isShowHistory ? 'opacity-100' : 'opacity-0'} transition-all ease-in-out duration-200`}>
                            {
                                dayNames.map((day, index) => (
                                    <Button type="button" key={index} color="light" className="flex font-bold items-center border-gray-800 select-none" onClick={getButtonDay}>
                                        <div className="flex flex-row justify-between sm:flex-col sm:justify-center items-center" >
                                            {day_icon[index % day_icon.length]}
                                            <span className=""> 禮拜{dayNames[(index + 1) % dayNames.length]} </span>
                                        </div>
                                    </Button>
                                ))
                            }
                        </div>)
                    }
                    <Button.Group className="flex justify-start items-center">
                        {/* 歷史時間 */}
                        <Button type="button" color="cyan" className="flex rounded-full font-bold items-center border-[2px] border-gray-800 mr-1 p-0 select-none" onClick={history_button}>
                            <div className="flex flex-col justify-center items-center p-0 m-0" >
                                <FaHistory className="h-5 w-5 sm:mb-2" color="dark" />
                                <span className="hidden sm:block"> 歷史 </span>
                            </div>
                        </Button>
                        {/* 即時時間 */}
                        <Button type="button" color="cyan" className="flex rounded-full font-bold items-center border-[2px] border-gray-800 mr-1 p-0 select-none" onClick={realtime_button}>
                            <div className="flex flex-col justify-center items-center p-0 m-0" >
                                <FaFireAlt className="h-5 w-5 sm:mb-2" color="dark" />
                                <span className="hidden sm:block"> 即時 </span>
                            </div>
                        </Button>
                        {/* 未來時間 */}
                        <Button type="button" color="cyan" className="flex rounded-full font-bold items-center border-[2px] border-gray-800 mr-1 p-0 select-none" onClick={future_button}>
                            <div className="flex flex-col justify-center items-center p-0 m-0" >
                                <SiFuturelearn className="h-5 w-5 sm:mb-2" color="dark" />
                                <span className="hidden sm:block"> 未來 </span>
                            </div>
                        </Button>
                    </Button.Group>
                </form>
            </div>
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
                        {((marker.value % 24 == 0) && (index % 5 == 0)) && marker.label}
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
    ))
};

export default Timeline;
