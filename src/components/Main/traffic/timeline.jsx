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
import { Toast_Component } from "@/components/utils/toast";



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

    const [message, setMessage] = useState(null);

    const [isDragging, setIsDragging] = useState(false);
    const timelineRef = useRef(null);

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
        let Hx_timeList = Hx_Date_list.sort((a, b) => a.getTime() - b.getTime()).reverse() // 歷史
        let forecast_timeList = Forecast_Date_list.sort((a, b) => a.getTime() - b.getTime()) // 預測

        // 過濾過期的預測資料
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

    // 顯示時間軸更新狀態
    useEffect(() => {
        if (timeMarkers.length <= 1) {
            setMessage("更新時間軸中...")
        } else {
            setMessage(null)
        }
    }, [timeMarkers])

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

    // 取得選擇的星期幾
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
        let selectedDay = dayToNumber[e.target.innerText?.slice(2)]

        let newTimeMakers = timeMarkers.filter((item) => ((new Date(item.dates).getDay() === selectedDay) && (item.value < 0)))

        setFilterTimeList(newTimeMakers)
        setSelectedIndex(0);
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

        setMessage(null)

        setIsShowFuture(!isShowFuture);

        const new_timeMakers = timeMarkers.filter((item) => item.value > 0)

        if (new_timeMakers.length > 0) {
            setFilterTimeList(new_timeMakers)
            setSelectedIndex(0);
        } else {
            setMessage("暫時無未來之預測資料")
        }
    }


    // 星期一至星期日的圖示
    var day_icon = [
        <TbSquareRoundedNumber1Filled key="1" className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber2Filled key="2" className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber3Filled key="3" className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber4Filled key="4" className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber5Filled key="5" className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber6Filled key="6" className="h-5 w-5" color="dark" />,
        <TbSquareRoundedNumber7Filled key="7" className="h-5 w-5" color="dark" />
    ]

    // 如果有篩選時間列表則替換
    if (filterTimeList?.length > 0) {
        timeMarkers = filterTimeList
        //console.log(timeMarkers)
    }

    var temp_time = []
    const timeMarkers_filter = (marker, index) => {
        // 篩選出不同天時間
        /*
        if (marker.value == 0) {
            return "現在"
        }
        */

        temp_time = Array.from(new Set(temp_time))

        let marker_day = new Date(marker.dates).toLocaleDateString()
        temp_time.push(marker_day)
        if (index % (Math.floor(timeMarkers.length * 0.2)) == 0) {
            return new Date(marker.dates).toLocaleDateString('zh-TW')
        }
    }

    return ((
        <div className="w-full">
            <div className="relative rounded-full mb-2 select-none">
                <form className="grid w-fit">
                    {//isShowHistory &&
                        (<div className={`grid bg-gray-300 border-[2px] border-gray-100 grid-cols-auto sm:grid-cols-7 mb-2 rounded-lg gap-1 w-max ${isShowHistory ? 'opacity-100' : 'opacity-0 '} transition-all ease-in-out duration-100`}>
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
                    <Button.Group className={`${(timeMarkers.length <= 1) && 'animate-pulse'} flex justify-start items-center space-x-3 w-fit`}>
                        {/* 歷史時間 */}
                        <Button type="button" color="light" className={`${(timeMarkers.length <= 1) && 'cursor-no-drop pointer-events-none'} flex rounded-full font-bold items-center border-[2px] border-gray-800 p-0 select-none`} onClick={history_button}>
                            <div className="flex flex-col justify-center items-center p-0 m-0" >
                                <FaHistory className="h-5 w-5 sm:mb-2" color="dark" />
                                <span className="hidden sm:block"> 歷史 </span>
                            </div>
                        </Button>
                        {/* 即時時間 */}
                        <Button type="button" color="red" className={`${(timeMarkers.length <= 1) && 'cursor-no-drop pointer-events-none'} flex rounded-full font-bold items-center border-[2px] border-gray-800 p-0 select-none`} onClick={realtime_button}>
                            <div className="flex flex-col justify-center items-center p-0 m-0" >
                                <FaFireAlt className="h-5 w-5 sm:mb-2" color="dark" />
                                <span className="hidden sm:block"> 即時 </span>
                            </div>
                        </Button>
                        {/* 未來時間 */}
                        <Button type="button" color="cyan" className={`${(timeMarkers.length <= 1) && 'cursor-no-drop pointer-events-none'} flex rounded-full font-bold items-center border-[2px] border-gray-800 p-0 select-none`} onClick={future_button}>
                            <div className="flex flex-col justify-center items-center p-0 m-0" >
                                <SiFuturelearn className="h-5 w-5 sm:mb-2" color="dark" />
                                <span className="hidden sm:block"> 未來 </span>
                            </div>
                        </Button>
                    </Button.Group>
                </form>
            </div>
            <div className={`${(timeMarkers.length <= 1) && 'animate-pulse'} relative h-4 bg-blue-200 rounded-full cursor-pointer select-none`}
                ref={timelineRef}
                onMouseDown={handleMouseDown}>
                {/* 藍色進度條 */}
                <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full select-none"
                    style={{ width: `${(selectedIndex / (timeMarkers.length - 1)) * 100}%` }} />

                {/* 時間標記 */}
                {timeMarkers.map((marker, index) => (
                    <div key={index}
                        className="absolute top-7 transform -translate-x-1/2 text-xs text-white select-none"
                        style={{ left: `${(index / (timeMarkers.length - 1)) * 100}%`, whiteSpace: 'nowrap' }}>
                        {timeMarkers_filter(marker, index)}
                    </div>
                ))}

                {/* 控制鈕 */}
                <Popover
                    content={
                        Content(
                            timeMarkers[selectedIndex]?.label,
                            (timeMarkers[selectedIndex]?.date || new Date().toLocaleString('zh-Hant-TW') + ' ' + `(禮拜${dayNames[new Date().getDay()]})`)
                        )
                    }
                    trigger="hover"
                    placement="top"
                >
                    <div
                        className="absolute top-[-5] w-7 h-7 bg-white rounded-full select-none"
                        style={{ left: `calc(${(selectedIndex / (timeMarkers.length - 1)) * 100}% - 2%)` }}
                    />
                </Popover>
            </div>
            {
                (message !== null) &&
                <Toast_Component
                    icon_text={"系統訊息"}
                    title={"系統訊息"}
                    contents={message}
                    durations={1000}
                />
            }
        </div>
    ))
};

export default Timeline;
