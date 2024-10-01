'use server'
// 取得TDX資料模組
/**
- Token_Expires: 過期日毫秒
    - -1: 使用自訂Access Token
    - 0: Token過期或無效
*/
export default async function Fetch_Data({ AccessToken = '', Token_Expires = 0, urls = [], isHistory = false, show_info = true }) {
    /*
        // = = = = = 回傳參數介紹 = = = = =
        - Fetch_Data_Result: 請求的資料結果

        - Fetch_Data_Info: 儲存資料請求回應資訊
            - fetch_status_code: 請求回應狀態碼
            - fetch_data: 請求回應結果訊息，也可能包含對方伺服器回傳的錯誤訊息
            - fetch_error: 請求錯誤訊息
            - fetch_error_format: 格式美化後的錯誤訊息
    */

    // 儲存資料請求結果
    var Fetch_Data_Result = [];
    var Fetch_Data_Info = {};

    // 儲存資料請求回應資訊
    var fetch_status_code = []
    var fetch_data = []
    var fetch_error = []
    var fetch_error_format = []
    var fetch_exception_error = null
    var fetch_OK = false

    // 檢查是否成功取得Token
    if ((AccessToken != null) && ((Token_Expires == -1) || (Token_Expires > 0))) {
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
                            console.error('\n[fetch_TDX]請求TDX資料錯誤:', err_msg);
                            fetch_error_format.push(HTTP_Status_Code[fetch_status_code]['reply'][err_msg])
                        } catch (e) {
                            console.error('\n[fetch_TDX]請求TDX資料錯誤:', err);
                            fetch_error_format.push(err)
                        }
                    })

                    return fetch_result
                })
            );
        } catch (e) {
            fetch_exception_error = e.message;
            console.error('[fetch_TDX]意外錯誤: ', e.message)
        }
    } else {
        fetch_exception_error = 'AccessToken未取得或無效，請查看後台詳細錯誤訊息'
        console.error(`[fetch_TDX]Error: ${fetch_exception_error}`)
    }

    // 檢查網路是否中斷
    if (!fetch_exception_error) {
        Object.entries(fetch_error).forEach(([key, value], index) => {
            if (value?.cause?.errno == "-3008") {
                fetch_exception_error = "網路連線已中斷，請確認你的網路已正確連接!"
            }
        })
    }

    // 顯示請求資訊
    if (show_info) {
        if (Token_Expires > 0) {
            var Token_Expires_format_time = () => {
                const expires_date = new Date(Token_Expires);

                const left_ms = new Date(Math.abs(Date.now() - expires_date.getTime())).getTime()
                //const milliseconds = Token_Expires % 1000; // 毫秒
                const s = Math.floor((left_ms / 1000) % 60);
                const m = Math.floor((left_ms / (60 * 1000)) % 60);
                const h = Math.floor((left_ms / (60 * 60 * 1000)) % 24);
                const d = Math.floor(left_ms / (24 * 60 * 60 * 1000));

                return `${d}天${h}時${m}分${s}秒 (${expires_date.toLocaleString('zh-Hant-TW')})`;
            }
        }

        // 顯示請求回應資訊
        const fetch_response = `
        =========TDX壅塞資料取得資訊========
        -------Access Token資訊-------
        Token: ${AccessToken}
        Token_Expires (Token剩餘時間、到期時間):  ${(Token_Expires > 0) ? Token_Expires_format_time() :
                (Token_Expires == 0) ? "Access Token無效" : "使用自訂的Access Token，無有效期限資訊"}
        -------------------------
        請求狀態碼: ${(fetch_status_code.length > 0) ? fetch_status_code : '無'}
        請求回應原始訊息: ${fetch_status_code.every((code) => code != 200) ? JSON.stringify(fetch_data, null, 2) : "無"}
        請求回應原始錯誤訊息: ${JSON.stringify(fetch_error, null, 4)}
        請求回應原始格式化錯誤訊息: ${JSON.stringify(fetch_error_format, null, 2)}
        意外錯誤訊息: ${fetch_exception_error || '無'}
        ===================================
        `.replaceAll(' ', '')
        console.log(fetch_response)
    }

    // 檢查完全成功取得資料
    if ((fetch_status_code.length > 0) && (fetch_status_code.every((code) => code && (code == 200)))) {
        fetch_OK = true
    }

    // 當Access Token過期
    if (Token_Expires == 0) {
        fetch_OK = false
    }

    Fetch_Data_Info = { fetch_OK, fetch_status_code, fetch_data, fetch_error, fetch_error_format, fetch_exception_error }

    return [Fetch_Data_Result, Fetch_Data_Info];
}