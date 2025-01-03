"use client";
import { useContext, useState, useEffect } from "react";
import useSWR, { mutate } from 'swr'


const getFetchUrl = (time, useExistToken, disabled) => {
    let fetch_url = null

    if (disabled) {
        return fetch_url
    }

    if ((time.constructor.name == "Array") && (time?.length > 0)) {
        const [selected_hour, selected_date] = time

        if (selected_hour < 0) {
            fetch_url = `/api/tdx/old?days=${Math.abs(selected_hour / 24)}&date=${selected_date}`
        } else if (selected_hour > 0) {
            fetch_url = `/api/tdx/forecast?days=${selected_hour / 24}&date=${selected_date}`
        } else {
            fetch_url = `/api/tdx/new?test_token=${useExistToken}`
        }
    }

    return fetch_url
}

// TDX資料取得API中控模組
export const useGetTraffic = (disabled = false, useExistToken = true, time = []) => {
    // 將所有 useState 移到函式開頭
    const [IsTokenError, setIsTokenError] = useState(false) // code: 401、400 [層級: Error] [可否給使用者得知: 否]
    const [IsAPIRateLimit, setIsAPIRateLimit] = useState(false); // code: 429 [層級: Warn] [可否給使用者得知: 是]
    const [IsDisconnect, setIsDisconnect] = useState(false); // code: -3008 [層級: Error] [可否給使用者得知: 是]


    var fetch_error_reply = '非常抱歉，目前無法取得資料，請再次重整網頁，如未改善請聯絡網站管理員!'

    const fetcher = async (url) => {
        const res = await fetch(url)
        const res_data = await res.json()

        const res_ok = res.ok
        const res_status = res.status

        const res_error = res_data?.error
        const res_error_msgs = res_error?.error
        const res_error_status = res_error?.status

        if (res_ok && !res_error) {
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
    }

    var fetch_url = getFetchUrl(time, useExistToken, disabled)

    var warn = null
    var { data, error } = useSWR(fetch_url !== null ? fetch_url : null, fetcher, {
        refreshInterval: 60 * 1000,
        revalidateOnFocus: false, // 停用聚焦地圖時重新驗證
        /*
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
            if ((error.status === 404) || (retryCount > 2)) return
            setTimeout(() => revalidate({ retryCount }), 1000 * 60)
        }
        */
    })

    if (fetch_url == null) {
        return [null, null, null]
    }

    if (IsAPIRateLimit) {
        //warn = error // 停用警告訊息（可選）
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