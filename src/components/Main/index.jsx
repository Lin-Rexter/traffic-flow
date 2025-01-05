"use client"
//import Loading from "@/app/loading";
import { useEffect } from 'react';
import { useENV } from "@/context";


const Main = ({ children }) => {
    // 載入環境變數
    const { ENVConfig, setENVConfig } = useENV();

    useEffect(() => {
        const fetch_env = async () => {
            return await fetch('/api/env',
                { method: "GET" }
            ).then(async (res) => {
                setENVConfig(await res.json());
            })
        };

        fetch_env()
    }, []);

    {/* h-[52.4rem] */ }
    return (
        <main className="relative h-full">
            {children}
        </main>
    )
}

export default Main;