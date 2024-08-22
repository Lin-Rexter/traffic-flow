"use client";
import React, { useState, useRef, useEffect } from "react";

const Timeline = () => {
    const [selectedIndex, setSelectedIndex] = useState(5); // 預設選擇"現在"
    const [selectedTime, setSelectedTime] = useState('現在')
    const [isChanged, setIsChanged] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const timelineRef = useRef(null);
    const handleRef = useRef(null);
    const hoverAreaRef = useRef(null);

    if(isDragging){
        console.log(selectedTime)
    }

    const timeMarkers = [
        { label: "1天", value: -24 },
        { label: "12小時", value: -12 },
        { label: "6小時", value: -6 },
        { label: "3小時", value: -3 },
        { label: "1小時", value: -1 },
        { label: "現在", value: 0 },
        { label: "1小時", value: 1 },
        { label: "3小時", value: 3 },
        { label: "6小時", value: 6 },
        { label: "12小時", value: 12 },
        { label: "1天", value: 24 },
    ];

    const handleMouseDown = (e) => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const timeline = timelineRef.current;
        const rect = timeline.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const nearestIndex = Math.round(percentage * (timeMarkers.length - 1));
        setSelectedIndex(nearestIndex);
    };

    useEffect(() => {
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mousemove", handleMouseMove);
        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, [isDragging]);


    useEffect(() => {
        if (isDragging) {
            setSelectedTime(timeMarkers[selectedIndex].label)
        }
    }, [isDragging])

    // 當時間軸移動時改變isChanged

    return (
        <div
            ref={hoverAreaRef}
            className="w-2/3 max-w-3xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`relative transition-all duration-300 ${isHovered ? "scale-110" : ""}`}>
                <div ref={timelineRef} className="w-full h-5 bg-blue-200 rounded-full relative">
                    <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                        style={{ width: `${(selectedIndex / (timeMarkers.length - 1)) * 100}%` }}
                    />
                </div>
                <div className="absolute top-0 left-0 w-full">
                    {timeMarkers.map((marker, index) => (
                        <div
                            key={index}
                            className="absolute transform -translate-x-1/2"
                            style={{
                                left: `${(index / (timeMarkers.length - 1)) * 100}%`,
                                top: "-14px",
                                width: index === 0 || index === timeMarkers.length - 1 ? "7px" : "4px",
                                marginLeft: index === 0 ? "3px" : index === timeMarkers.length - 1 ? "-3px" : "0",
                            }}
                        >
                            <div
                                className={`h-10 bg-white mb-2 ${index === 0 ? "rounded-l" : index === timeMarkers.length - 1 ? "rounded-r" : ""}`}
                                style={{ width: "100%" }}
                            />
                            <span className="absolute top-12 left-1/2 transform -translate-x-1/2 text-sm text-white whitespace-nowrap select-none">
                                {marker.label}
                            </span>
                        </div>
                    ))}
                </div>
                <div
                    ref={handleRef}
                    className={`absolute top-[-10px] w-8 h-8 bg-white border-4 border-blue-500 rounded-full cursor-pointer transition-all duration-300 ${isDragging ? "scale-125" : ""}`}
                    style={{ left: `calc(${(selectedIndex / (timeMarkers.length - 1)) * 100}% - 16px)` }}
                    onMouseDown={handleMouseDown}
                />
            </div>
        </div>
    );
};

export default Timeline;
