import React, { createContext, useState, useContext } from 'react';

const TimeContext = createContext();

export const TimeProvider = ({ children }) => {
    const [selectedTime, setSelectedTime] = useState(0);
    console.log("取得時間1:", selectedTime)

    return (
        <TimeContext.Provider value={{ selectedTime, setSelectedTime }}>
            {children}
        </TimeContext.Provider>
    );
};

export const useTime = () => {
    const context = useContext(TimeContext);
    if (!context) {
        throw new Error('useTime must be used within a TimeProvider');
    }
    return context;
};