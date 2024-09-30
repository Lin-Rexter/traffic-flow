"use client";
import { useContext, useState, useEffect } from "react";
import useSWR, { mutate } from 'swr'

const clearCache = () => mutate(
    () => true,
    undefined,
    { revalidate: false }
)

// TDX資料取得API中控模組
export const useGetTraffic = (disabled = false, useExistToken = true, time = []) => {
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
        const response = await res.json()

        if (res.ok) {
            setIsAPIRateLimit(false)
        }

        if (!res.ok || response.error) {
            let error = new Error()
            error.info = response.error
            error.status = res.status

            if (error?.info?.status?.includes(429)) {
                setIsAPIRateLimit(true)
            } else {
                setIsAPIRateLimit(false)
            }

            throw error
        }

        return response
    }

    //clearCache()
    var fetch_url = null
    if ((time.constructor.name == "Array") && (time?.length > 0)) {
        var [selected_hour, selected_date] = time

        if (selected_hour < 0) {
            fetch_url = `/api/tdx/old?days=${Math.abs(selected_hour / 24)}&date=${selected_date}`
        } else if (selected_hour > 0) {
            fetch_url = `/api/tdx/forecast?days=${selected_hour / 24}&date=${selected_date}`
        } else {
            fetch_url = `/api/tdx/new?test_token=${useExistToken}`
        }
    }


    // 每60秒更新一次資料
    if (fetch_url !== null) {
        var warn = null
        var { data, error } = useSWR(fetch_url, fetcher, {
            refreshInterval: 60 * 1000,
            onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
                if (error.status === 404) {
                    return
                }

                if (retryCount > 1) return

                setTimeout(() => revalidate({ retryCount }), 1000 * 60)
            }
        })

        if (!IsAPIRateLimit) {
            warn = null
        } else {
            warn = "[系統繁忙]\n目前為舊資料，正在努力取得最新資料中🤯，請稍後..."
        }

        return [data, error, warn]
    }
}