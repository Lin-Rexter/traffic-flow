"use client"
import React, { createContext, useState, useContext, useEffect } from 'react';

const ENVContext = createContext();
const TimeContext = createContext();
const DrawerContext = createContext();

// = = = = = 跨組件共享變數 = = = = =
export const ENVProvider = ({ children }) => {
    const [ENVConfig, setENVConfig] = useState(null);

    return (
        <ENVContext.Provider value={{ ENVConfig, setENVConfig }}>
            {children}
        </ENVContext.Provider>
    );
};

export const TimeProvider = ({ children }) => {
    const [selectedTime, setSelectedTime] = useState([0, null]);

    return (
        <TimeContext.Provider value={{ selectedTime, setSelectedTime }}>
            {children}
        </TimeContext.Provider>
    );
};

export const DrawerProvider = ({ children }) => {
    const [showDrawer, setShowDrawer] = useState(false);

    return (
        <DrawerContext.Provider value={{ showDrawer, setShowDrawer }}>
            {children}
        </DrawerContext.Provider>
    );
};

// = = = = = 取得共享變數內容 = = = = =
export const useENV = () => {
    const context = useContext(ENVContext);
    if (!context) {
        throw new Error('useENV must be used within a ENVProvider');
    }
    return context;
};

export const useTime = () => {
    const context = useContext(TimeContext);
    if (!context) {
        throw new Error('useTime must be used within a TimeProvider');
    }
    return context;
};

export const useDrawer = () => {
    const context = useContext(DrawerContext);
    if (!context) {
        throw new Error('useDrawer must be used within a DrawerProvider');
    }
    return context;
};