"use client";
import { useState, useEffect } from "react";
import useSWR from 'swr'


export const useGetTraffic = (disabled = false, test = true) => {
    if (disabled) {
        return [null, null, null]
    }
    /*
    const [details, setDetails] = useState([]);
    const [code, setCode] = useState(0);
    //const [isLoading, setLoading] = useState(false);

    // = = = = = = = = 方式1 = = = = = = = = //
    useEffect(() => {
        //setLoading(true)
        function fetchData() {
            try {
                const geojson_url = "/api/tdx/new";

                
                const options = {
                    method: "GET",
                    cache: 'no-cache' //停止快取
                };

                fetch(geojson_url, options)
                    .then((res) => {
                        setCode(res.status)
                        return res.json()
                    })
                    .then((data) => {
                        setDetails(data);
                        //setLoading(False);
                    })
                    .catch((err) => {
                        console.log("錯誤:", err);
                    });
            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                // 每60秒更新一次資料
                setTimeout(fetchData, 60 * 1000);
                const now = new Date();
                const location_time = now.toLocaleString();
                console.log(`${location_time}: 壅塞資料已更新! (每60秒)`);
            }
        }

        fetchData();
    }, []);

    return [details, code]
    */

    const [IsAPIRateLimit, setIsAPIRateLimit] = useState(false);

    const fetcher = async url => {
        const res = await fetch(url)

        if (!res.ok) {
            const error = new Error('獲取資料發生錯誤!')

            error.info = await res.json()
            error.status = res.status

            if (error.info.status.includes(429)) {
                setIsAPIRateLimit(true)
            } else {
                setIsAPIRateLimit(false)
            }

            throw error
        }

        return res.json()
    }

    var warn = null
    var { data, error } = useSWR(`/api/tdx/new?test=${!test}`, fetcher, { refreshInterval: 60 * 1000 }) // 每60秒更新一次資料 

    if (!IsAPIRateLimit) {
        warn = null
    } else {
        data = null
        error = null
        warn = "請求次數過多，請稍後..."
    }

    return [data, error, warn]
}