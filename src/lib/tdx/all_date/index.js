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


    try {
        const [Dates, setDates] = useState([])

        useEffect(() => {
            const fetch_supabase_date = async () => {
                const Supabase = new Supabase_CRUD()

                const Hx_Result = await Supabase.read({
                    table: 'Live_Data',
                    columns: 'update_time',
                    options: { count: true },
                })
                const Forecast_Result = await Supabase.read({
                    table: 'Live_Forecast_Data',
                    columns: 'update_time',
                    options: { count: true },
                })
                setDates([Hx_Result, Forecast_Result])
            }
            fetch_supabase_date()
        }, [])

        if (Dates) {
            const [Hx_Result, Live_Forecast_Data] = Dates

            if (Live_Forecast_Data?.error || Hx_Result?.error) {
                response.error = Live_Forecast_Data.error || Hx_Result.error
                return response
            }

            if ((Live_Forecast_Data?.count > 0) && (Hx_Result?.count > 0)) {
                var Forecast_temp_date = []
                var Hx_temp_date = []

                // 預測資料
                Live_Forecast_Data.data.forEach((item) => {
                    let item_date = new Date(item.update_time)
                    if (Forecast_temp_date.length === 0 ||
                        !Forecast_temp_date.some((row) =>
                            row.getDate() === item_date.getDate() &&
                            row.getHours() === item_date.getHours()
                        )) {
                        Forecast_temp_date.push(item_date.addHours(0)) //.toISOString()
                    }
                })
                // 歷史資料
                Hx_Result.data.forEach((item) => {
                    let item_date = new Date(item.update_time)
                    if (Hx_temp_date.length === 0 ||
                        (
                            ([6, 9, 12, 15, 18, 21].includes(item_date.getHours())) &&
                            !Hx_temp_date.some((row) =>
                                row.getDate() === item_date.getDate() &&
                                row.getHours() === item_date.getHours()
                            )
                        )
                    ) {
                        Hx_temp_date.push(item_date.addHours(0))
                    }
                })

                response.data = [Array.from(new Set(Forecast_temp_date)), Array.from(new Set(Hx_temp_date))]

                return response
            }

            response.error = '查無資料!'
            return response
        }
    } catch (err) {
        console.error('[GetTDXDate]Error:', err.message);
        response.error = err.message
        return response
    }
}