"use client";
import { useContext, useState, useEffect } from "react";
import useSWR, { mutate } from 'swr'


const clearCache = () => mutate(
    () => true,
    undefined,
    { revalidate: false }
)
clearCache()

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

    const [IsTokenError, setIsTokenError] = useState(false) // code: 401、400 [層級: Error] [可否給使用者得知: 否]
    const [IsAPIRateLimit, setIsAPIRateLimit] = useState(false); // code: 429 [層級: Warn] [可否給使用者得知: 是]
    const [IsDisconnect, setIsDisconnect] = useState(false); // code: -3008 [層級: Error] [可否給使用者得知: 是]

    var fetch_error_reply = '非常抱歉，目前無法取得資料，請再次重整網頁，如未改善請聯絡網站管理員!' // 當非 IsDisconnect 或 IsAPIRateLimit 狀況時，給使用者的警告訊息。

    
    const fetcher = async (url) => {
        const res = await fetch(url)
        const res_data = await res.json()

        const res_ok = res.ok
        const res_status = res.status

        const res_error = res_data?.error
        const res_error_msgs = res_error?.error
        const res_error_status = res_error?.status

        if (res_ok && !res_error){
            return res_data
        }

        var error = {}
        error.info = fetch_error_reply
        error.status = res_status ?? []

        if (res_error_status.some((status) => status == 429)) {
            setIsAPIRateLimit(true)
            error.info = "[系統繁忙]\n目前為舊資料，正在努力取得最新資料中🤯，請稍後..."
            console.warn(error.info)
            throw error
        } else {
            setIsAPIRateLimit(false)
        }

        if (res_error_status.some((status) => (status == 400) || (status == 401))) {
            setIsTokenError(true)
            throw error
        } else {
            setIsTokenError(false)
        }

        if (res_error_status.some((status) => status == -3008)) {
            setIsDisconnect(true)
            error.info = res_error_msgs
            throw error
        } else {
            setIsDisconnect(false)
        }

        if (!res_ok || res_error) {
            throw error
        }

        /*
        if (res.ok && res_data?.error) {
            setIsAPIRateLimit(false)
        }

        if (!res.ok || res_data?.error) {
            let error = new Error()
            error.info = res_data?.error
            error.status = res.status

            if (res_data?.error?.status?.includes(429)) {
                error.info = null
                setIsAPIRateLimit(true)
            } else {
                setIsAPIRateLimit(false)
            }

            throw error
        }
        */
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

        if (IsAPIRateLimit) {
            warn = error
            error = null
        }

        if (IsTokenError) {
            warn = null
        }

        if (IsDisconnect) {
            warn = null
        }

        return [data, error, warn]
    }
}