"use client";
//import useSWR from 'swr'

const geojson_url = "/api/tdx";

export const get_geojson = async() => {
    /*
    const fetcher = (...args) => fetch(...args).then((res) => {
            return res.json();
        }).then((data) => { 
            //setDetails(data.section_geojson);
            return data.section_geojson
        }).catch((err) => {
            console.log('錯誤:', err);
        })
      */

    const options = {
        method: "GET",
        //cache: 'no-cache' //停止快取
    };

    //const { data, error } = useSWR(geojson_url, fetcher, options)

    const fetch_result = await fetch(geojson_url, options)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            //setDetails(data.section_geojson);
            return data.section_geojson;
        })
        .catch((err) => {
            console.log("錯誤:", err);
        });

    return fetch_result;
};