export default async function Fetch_Data(AccessToken, urls = [String], isHistory = false) {
    /*
        // = = = = = 參數介紹 = = = = =
        - Fetch_Data_Result: 請求的資料結果

        - Fetch_Data_Info: 儲存資料請求回應資訊
            - fetch_status_code: 請求回應狀態碼
            - fetch_data: 請求回應結果訊息，也可能包含對方伺服器回傳的錯誤訊息
            - fetch_error: 請求錯誤訊息
            - fetch_error_format: 格式美化後的錯誤訊息
    */

    // 儲存資料請求結果
    var Fetch_Data_Result = [];
    var Fetch_Data_Info = [];

    // 儲存資料請求回應資訊
    var fetch_status_code = []
    var fetch_data = []
    var fetch_error = []
    var fetch_error_format = []

    // 檢查是否成功取得Token
    if (AccessToken != null) {
        /* = = = = = = = = = = = =
        // shape_result: 取得各個路段的經緯度
        // live_result: 取得各個路段的壅塞程度
        // section_result: 取得各個路段代號的資訊
        = = = = = = = = = = = = */

        // 取得所有選擇的TDX資料
        // TDX請求資料回傳狀態: https://motc-ptx.gitbook.io/tdx-xin-shou-zhi-yin/api-shi-yong-shuo-ming/api-shou-quan-yan-zheng-yu-shi-yong-fang-shi#id-5.-hu-jiao-hou-hui-chuan-zhuang-tai
        // HTTP Status Code: 200, 401, 429, 416, 423
        const HTTP_Status_Code = {
            200: { 'reply': '呼叫成功' },
            401: {
                'reply': {
                    'no Authorization header found': '[Unauthorized] 未帶入Authorization  HTTP Header',
                    'invalid token': '[Unauthorized] 帶入至Authorization  HTTP Header的token是無效或錯誤的',
                    'Access token does not have the required scope/role: Missing required realm role': '[Unauthorized] 不具有呼叫該服務類型的權限'
                }
            },
            429: {
                'reply': {
                    'API rate limit exceeded': '呼叫次數超過上限'
                }
            },
            416: { 'reply': '超過最大平行連接數 (限制每個IP只能發起60個連接)' },
            423: { 'reply': '超過單位時間能平行的請求數 (50次/秒)' }
        }

        try {
            // 暫存當前請求網址
            var url = ""

            Fetch_Data_Result = await Promise.all(
                Object.values(urls).map(async (url) => {
                    const fetch_result = await fetch(url, {
                        method: "GET",
                        headers: {
                            "authorization": `Bearer ${AccessToken}`,
                            "Accept-Encoding": "br,gzip" // 資料壓縮
                        },
                        cache: 'no-store' //isHistory ? 'force-cache' : 'no-store' //cache: 'no-store', //'force-dynamic', // next: { revalidate: 0 } //停止快取
                    }).then(async (res) => {
                        url = res.url
                        fetch_status_code.push(res.status)
                        if (isHistory) {
                            return (await res.text()).match(/.+/g).map(JSON.parse);
                        }
                        return res.json();
                    }).then((data) => {
                        //console.log(data)
                        // 當請求資料錯誤時，儲存請求回應錯誤訊息
                        if (fetch_status_code.at(-1) != 200) {
                            fetch_data.push({ '請求網址': url, ...data })
                        } else if (fetch_status_code.every((code) => code != 200)) {
                            fetch_data.push({ '請求網址': url, "message": "請求成功" })
                        }
                        return data
                    }).catch((err) => {
                        fetch_error.push(err)
                        // 防止錯誤訊息為內部引起
                        try {
                            const err_msg = err.message.split(',')[1].split('\"')[1].trim()
                            console.log('\n錯誤[取得TDX資料]:', err_msg);
                            fetch_error_format.push(HTTP_Status_Code[fetch_status_code]['reply'][err_msg])
                        } catch (e) {
                            console.log('\n錯誤[取得TDX資料]:', err);
                            fetch_error_format.push(err)
                        }
                    })

                    return fetch_result
                })
            );
        } catch (error) {
            console.log('[fetch_all]Error: ', error)
        }
    }

    Fetch_Data_Info = [fetch_status_code, fetch_data, fetch_error, fetch_error_format]

    return [Fetch_Data_Result, Fetch_Data_Info];
}