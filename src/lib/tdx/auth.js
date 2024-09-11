// 請求TDX的Token
export default async function GetToken(id, secret, test=false) {
    if (test) {
        return process.env.NEXT_PUBLIC_TDX_ACCESS_TOKEN || null
    }

    // 設置預設金鑰的ID、Secret
    const parameter = {
        grant_type: "client_credentials",
        client_id: id,
        client_secret: secret
    };

    // 平台的API不收JSON，所以將金鑰轉換成需求的格式(application/x-www-form-urlencoded)
    const requestBody = new URLSearchParams(Object.entries(parameter)).toString();

    // 用來申請token的API
    const auth_url = "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";

    // = = = = = = = = 請求方式 1 = = = = = = = =
    /*
    var options = {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: requestBody
    };

    const res = await fetch(auth_url, options)
    const data = await res.json()
    return data.access_token
    */

    //  = = = = = = = = 請求方式 2 = = = = = = = =
    try{
        var result = await fetch(auth_url, {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "Accept-Encoding": 'br,gzip'
            },
            //cache: 'no-cache', //'force-dynamic', //停止快取
            body: requestBody
        }).then((res) => {
            const data = res.json();
            return data
        }).then((data) => {
            console.log(`\n已取得Access Token (${data.access_token})，有效期限(秒): ${data.expires_in}\n`);
            const token = data.access_token;
            return token
        }).catch((e) => {
            console.error('[GetToken]Error:', e);
            return e
        })

        return result
    } catch (e) {
        console.error('[GetToken]Error:', e);
        return e
    }
}
