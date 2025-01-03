'use client'
import React, { useState, useEffect } from "react";
import { Supabase_CRUD } from '@/lib/supabase/client_without_SSR'

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

// 將函式改寫為組件
export const GetTDXDate = () => {
    //const [dates, setDates] = useState([]);
    const [response, setResponse] = useState({
        data: [],
        error: null
    });

    useEffect(() => {
        const fetch_supabase_date = async () => {
            try {
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

                if (Forecast_Result?.error || Hx_Result?.error) {
                    setResponse({
                        data: [],
                        error: Forecast_Result.error || Hx_Result.error
                    });
                    return;
                }

                if ((Forecast_Result?.count > 0) && (Hx_Result?.count > 0)) {
                    var Forecast_temp_date = [];
                    var Hx_temp_date = [];

                    // 處理預測資料
                    Forecast_Result.data.forEach((item) => {
                        let item_date = new Date(item.update_time);
                        if (Forecast_temp_date.length === 0 ||
                            ([6, 9, 12, 15, 18, 21].includes(item_date.getHours()) &&
                                !Forecast_temp_date.some((row) =>
                                    row.getDate() === item_date.getDate() &&
                                    row.getHours() === item_date.getHours()
                                ))
                        ) {
                            Forecast_temp_date.push(item_date.addHours(0));
                        }
                    });

                    // 處理歷史資料
                    Hx_Result.data.forEach((item) => {
                        let item_date = new Date(item.update_time);
                        if (Hx_temp_date.length === 0 ||
                            ([6, 9, 12, 15, 18, 21].includes(item_date.getHours()) &&
                                !Hx_temp_date.some((row) =>
                                    row.getDate() === item_date.getDate() &&
                                    row.getHours() === item_date.getHours()
                                ))
                        ) {
                            Hx_temp_date.push(item_date.addHours(0));
                        }
                    });

                    setResponse({
                        data: [Array.from(new Set(Forecast_temp_date)), Array.from(new Set(Hx_temp_date))],
                        error: null
                    });
                } else {
                    setResponse({
                        data: [],
                        error: '查無資料!'
                    });
                }
            } catch (err) {
                console.error('[GetTDXDate]Error:', err.message);
                setResponse({
                    data: [],
                    error: err.message
                });
            }
        };

        fetch_supabase_date();
    }, []);

    return response;
};