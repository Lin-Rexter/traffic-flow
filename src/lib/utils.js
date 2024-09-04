//"use client";
//import useSWR from 'swr'

//const geojson_url = "/api/tdx";
/*
export const get_geojson = async() => {

    const fetcher = (...args) => fetch(...args).then((res) => {
            return res.json();
        }).then((data) => { 
            //setDetails(data.section_geojson);
            return data.section_geojson
        }).catch((err) => {
            console.log('錯誤:', err);
        })

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
*/

// 檢查物件是否存在指定屬性
// hasOwnProperty = Object.prototype.hasOwnProperty
// 較新版本可用: Object.hasOwn
export const has = (object, key) => object ? hasOwnProperty.call(object, key) : false;

// 相差天數
export const DiffDays = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}