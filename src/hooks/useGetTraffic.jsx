"use client";
import { useContext, useState, useEffect } from "react";
import useSWR, { mutate } from 'swr'

const clearCache = () => mutate(
    () => true,
    undefined,
    { revalidate: false }
)

export const useGetTraffic = (disabled = false, useExistToken = true, time = 0) => {
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

        if (!res.ok) {
            const error = new Error('獲取資料發生錯誤!')

            error.info = response.error
            error.status = res.status

            if (error.info.status.includes(429)) {
                setIsAPIRateLimit(true)
            } else {
                setIsAPIRateLimit(false)
            }

            throw error
        }

        if (response.error) {
            const error = new Error(response.error)
            error.info = response.error
            error.status = res.status
            throw error
        }

        return response
    }

    //clearCache()
    var fetch_url = null
    //console.log("time", time)
    if (time < 0) {
        fetch_url = `/api/tdx/old?days=${Math.abs(time / 24)}`
    } else if (time > 0) {
        fetch_url = `/api/tdx/forecast?days=${time / 24}`
    } else {
        fetch_url = `/api/tdx/new?test_token=${useExistToken}`  
    }

    // 每60秒更新一次資料 
    var warn = null
    var { data, error } = useSWR(fetch_url, fetcher, { refreshInterval: 60 * 1000 })

    if (!IsAPIRateLimit) {
        warn = null
    } else {
        data = null
        error = null
        warn = "請求次數過多，請稍後..."
    }

    return [data, error, warn]
}