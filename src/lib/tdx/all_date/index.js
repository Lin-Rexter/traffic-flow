'use client'
import React, { useState, useEffect } from "react";
import { Supabase_CRUD } from '@/lib/supabase/client_without_SSR'


Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

// 取得儲存的TDX歷史壅塞資料日期
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
                const Result = await Supabase.read({
                    table: 'Live_Data',
                    columns: 'update_time',
                    options: { count: true },
                })
                setDates(Result)
            }
            fetch_supabase_date()
        }, [])

        if (Dates) {
            const { data, count, error } = Dates

            if (error) {
                response.error = error
                return response
            }

            if (count > 0) {
                var temp_date = []

                data.forEach((item) => {
                    temp_date.push(new Date(item.update_time).addHours(0).toISOString())
                })

                response.data = Array.from(new Set(temp_date))

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