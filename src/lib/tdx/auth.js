import { cookies } from 'next/headers'
import { setEnvValue } from '@/lib/utils'

/*
const Token_JWT = async (access_token) => {
    const secret = new TextEncoder().encode(access_token)
    const alg = 'HS256'

    const jwt = await new jose.SignJWT({ 'urn:example:claim': true })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('urn:example:issuer')
        .setAudience('urn:example:audience')
        .setExpirationTime('24h')
        .sign(secret)

    return jwt
}
*/

// 請求TDX的Token
export default async function GetToken(id, secret, test = false) {
    var Response = {
        AccessToken: null,
        Expires_ms: 0, // 過期日毫秒
        Error: null,
        status_code: []
    }

    const cookieStore = await cookies()
    var TDX_Access_token = process.env.TDX_ACCESS_TOKEN

    if (test) {
        if (!TDX_Access_token) {
            throw new Error("\n ⚠️ 已設置使用現有Access token，但.env.local檔案裡未設定環境變數(TDX_ACCESS_TOKEN)。\n")
        }
        Response.AccessToken = TDX_Access_token
        Response.Expires_ms = -1
        return Response
    }

    // 檢查Token是否過期
    if (cookieStore.has('tdx_token_expires_in')) {
        const milliseconds = cookieStore.get('tdx_token_expires_in').value

        Response.AccessToken = TDX_Access_token
        Response.Expires_ms = Number(milliseconds)
        return Response
    } {
        console.log("\nAccess Token已過期，更新中...\n")
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
    try {
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
            Response.status_code.push(res.status)
            return data
        }).then((data) => {
            if (data.error) {
                let err_msg = ""
                if (data.error === 'unauthorized_client') {
                    err_msg = 'TDX client無效，可能為超量使用停權或其他因素，請重新至 https://tdx.transportdata.tw/user/dataservice/key 建立API金鑰(Client Id和Client Secret)';
                }
                throw new Error(`\n[GetToken]: ${err_msg}`);
            }

            const token = data.access_token;
            const expires = data.expires_in;
            console.log(`\n已取得Access Token (${token})，有效期限(秒): ${expires}\n`);

            const t = new Date();
            t.setSeconds(t.getSeconds() + expires);
            //t.setHours(t.getUTCHours() + 8);
            const expiration_date = t.getTime();

            // 儲存token有效期限至cookie
            cookieStore.set('tdx_token_expires_in', String(expiration_date), { maxAge: expires }) // 儲存有效期限至cookie

            // 儲存Access Token
            setEnvValue('TDX_ACCESS_TOKEN', token)

            Response.AccessToken = token
            Response.Expires_ms = expires

            return Response
        }).catch((e) => {
            console.error('[GetToken]錯誤:', e.message);
            Response.Error = e.message
            return Response
        })

        return result
    } catch (e) {
        console.error('[GetToken]例外錯誤:', e.message);
        Response.Error = e.message
        return Response
    }
}