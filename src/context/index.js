import React, { createContext, useState, useContext } from 'react';

const TimeContext = createContext();

// 跨組件共享變數
export const TimeProvider = ({ children }) => {
    const [selectedTime, setSelectedTime] = useState(0);

    return (
        <TimeContext.Provider value={{ selectedTime, setSelectedTime }}>
            {children}
        </TimeContext.Provider>
    );
};

// 取得共享變數內容
export const useTime = () => {
    const context = useContext(TimeContext);
    if (!context) {
        throw new Error('useTime must be used within a TimeProvider');
    }
    return context;
};