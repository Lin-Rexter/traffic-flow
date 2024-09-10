'use client'
import React, { useState, useEffect } from "react";
import { Supabase_CRUD } from '@/lib/supabase/client_without_SSR'


Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

// 取得儲存的TDX壅塞資料日期
export const GetTDXDate = () => {
    var response = {
        data: [],
        error: null
    }

    const Supabase = new Supabase_CRUD()

    try {
        const [Dates, setDates] = useState([])
        useEffect(() => {
            const fetch_supabase_date = async () => {
                const His_Result = await Supabase.read({
                    table: 'Live_Data',
                    columns: 'update_time',
                    options: { count: true },
                })
                const Forecast_Result = await Supabase.read({
                    table: 'Live_Forecast_Data',
                    columns: 'update_time',
                    options: { count: true },
                })
                setDates([His_Result, Forecast_Result])
            }
            fetch_supabase_date()
        }, [])

        if (Dates) {
            const [His_Result, Live_Forecast_Data] = Dates

            if (Live_Forecast_Data.error || His_Result.error) {
                response.error = Live_Forecast_Data.error || His_Result.error
                return response
            }

            if ((Live_Forecast_Data.count > 0) && (His_Result.count > 0)) {
                var Forecast_temp_date = []
                var His_temp_date = []

                Live_Forecast_Data.data.forEach((item) => {
                    Forecast_temp_date.push(new Date(item.update_time).addHours(0).toISOString())
                })
                His_Result.data.forEach((item) => {
                    His_temp_date.push(new Date(item.update_time).addHours(0).toISOString())
                })

                response.data = [Array.from(new Set(Forecast_temp_date)), Array.from(new Set(His_temp_date))]

                return response
            }

            response.error = '查無資料!'
            return response
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
        response.error = error.message
        return response
    }
}