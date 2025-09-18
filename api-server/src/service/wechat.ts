/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import axios from 'axios';
import crypto from 'crypto';
import xml2js from 'xml2js';
import config from '~/config';

// 微信小程序会话信息接口
interface WechatMpSessionInfo {
    openid: string;
    session_key: string;
    unionid: string;
}

// 微信小程序手机号信息接口
interface WechatMpPhoneInfo {
    phoneNumber: string;
    purePhoneNumber: string;
    countryCode: string;
    openid: string;
    unionid: string;
}

// 微信小程序会话信息响应接口
export interface WechatMpSessionInfoResponse {
    success?: boolean;
    message?: string;
    data?: WechatMpSessionInfo;
}

// 微信小程序手机号信息响应接口
export interface WechatMpPhoneInfoResponse {
    success?: boolean;
    message?: string;
    data?: WechatMpPhoneInfo;
}

// 模板数据接口
export interface TemplateData {
    [key: string]: {
        value: string;
    };
}

// 发送小程序订阅消息参数接口
export interface SendSubscribeMessageParams {
    // openid
    touser: string;
    template_id: string;
    page: string;
    data: TemplateData;
    lang?: 'zh_CN';
}

// 发送公众号模板消息参数接口
export interface SendOaTemplateMessageParams {
    touser: string;
    template_id: string;
    url?: string;
    miniprogram?: {
        appid: string;
        pagepath: string;
    };
    data: TemplateData;
}

// 发送订阅消息响应接口
interface SendSubscribeMessageResponse {
    errcode: number;
    errmsg?: string;
}

// 微信公众号用户信息接口
export interface WechatOaUserInfo {
    subscribe: 0 | 1;
    openid: string;
    nickname: string;
    unionid: string;
}

/**
 * AES解密函数
 * @param session_key 会话密钥
 * @param iv 初始化向量
 * @param encryptedData 加密数据
 * @returns 解密结果
 */
function decode(session_key: string, iv: string, encryptedData: string) {
    const sessionKeyBuffer = Buffer.from(session_key, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);

    decipher.setAutoPadding(true);

    try {
        let decoded = decipher.update(encryptedData, 'base64', 'utf8');

        decoded += decipher.final('utf8');

        return {
            success: true,
            data: JSON.parse(decoded)
        };
    } catch (e) {
        return { success: false };
    }
}

/**
 * 获取用户小程序会话信息
 * @param js_code 微信小程序授权码
 * @returns 会话信息响应
 */
export async function getUserMpSession(js_code: string): Promise<WechatMpSessionInfoResponse> {
    const res = await axios.request({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        method: 'GET',
        params: {
            ...config.wechat.ump,
            js_code,
            grant_type: 'authorization_code'
        }
    });
    try {
        // 关键路径日志（避免泄露敏感数据）
        console.log('[wechat.getUserMpSession] request', {
            appid: config.wechat.ump && config.wechat.ump.appid,
            hasSecret: !!(config.wechat.ump && config.wechat.ump.secret),
            jsCodeLen: js_code ? String(js_code).length : 0
        });
        console.log('[wechat.getUserMpSession] response', {
            hasErrCode: !!res.data.errcode,
            errcode: res.data.errcode,
            errmsg: res.data.errmsg,
            hasOpenid: !!res.data.openid,
            hasSessionKey: !!res.data.session_key
        });
    } catch (err) {}

    if (res.data.errcode) {
        return {
            success: false,
            message: res.data.errmsg
        };
    }

    return {
        success: true,
        data: res.data
    };
}

/**
 * 获取PC端小程序会话信息
 * @param js_code 微信小程序授权码
 * @returns 会话信息响应
 */
export async function getPcMpSession(js_code: string): Promise<WechatMpSessionInfoResponse> {
    const res = await axios.request({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        method: 'GET',
        params: {
            ...config.wechat.pmp,
            js_code,
            grant_type: 'authorization_code'
        }
    });

    if (res.data.errcode) {
        return {
            success: false,
            message: res.data.errmsg
        };
    }

    return {
        success: true,
        data: res.data
    };
}

/**
 * 获取小程序用户手机号信息
 * @param js_code 微信小程序授权码
 * @param iv 初始化向量
 * @param encryptedData 加密数据
 * @returns 手机号信息响应
 */
export async function getUserMpPhone(
    js_code: string,
    iv: string,
    encryptedData: string
): Promise<WechatMpPhoneInfoResponse> {
    try {
        console.log('[wechat.getUserMpPhone] begin', {
            jsCodeLen: js_code ? String(js_code).length : 0,
            hasIv: !!iv,
            hasEncryptedData: !!encryptedData
        });
    } catch (err) {}

    const mpSessionInfo = await getUserMpSession(js_code);

    if (!mpSessionInfo.success) {
        return {
            success: false,
            message: mpSessionInfo.message
        };
    }

    const ret = decode(mpSessionInfo.data.session_key, iv, encryptedData);

    try {
        console.log('[wechat.getUserMpPhone] decode result', {
            success: ret.success,
            hasData: !!ret.data
        });
    } catch (err) {}

    return {
        success: ret.success,
        data: {
            ...ret.data,
            openid: mpSessionInfo.data.openid,
            unionid: mpSessionInfo.data.unionid
        }
    };
}

// 用户小程序接口凭证缓存
let userMpAccessToken = null;
let userMpAccessTokenExpire = 0;
let userMpAccessTokenStartAt = 0;

/**
 * 获取用户小程序访问令牌
 * @returns 访问令牌
 */
export async function getUserMpAccessToken(): Promise<string> {
    if (userMpAccessToken === null || Date.now() - userMpAccessTokenStartAt >= userMpAccessTokenExpire) {
        userMpAccessTokenStartAt = Date.now();

        const res = await axios.request({
            url: 'https://api.weixin.qq.com/cgi-bin/token',
            method: 'GET',
            params: {
                ...config.wechat.ump,
                grant_type: 'client_credential'
            }
        });

        if (!res.data.access_token) {
            return await getUserMpAccessToken();
        }

        userMpAccessToken = res.data.access_token;
        userMpAccessTokenExpire = res.data.expires_in * 1000;
    }

    return userMpAccessToken;
}

// 公众号接口凭证缓存
let oaAccessToken = null;
let oaAccessTokenExpire = 0;
let oaAccessTokenStartAt = 0;

/**
 * 获取公众号访问令牌
 * @returns 访问令牌
 */
export async function getOaAccessToken(): Promise<string> {
    if (oaAccessToken === null || Date.now() - oaAccessTokenStartAt >= oaAccessTokenExpire) {
        oaAccessTokenStartAt = Date.now();

        const res = await axios.request({
            url: 'https://api.weixin.qq.com/cgi-bin/token',
            method: 'GET',
            params: {
                ...config.wechat.oa,
                grant_type: 'client_credential'
            }
        });

        if (!res.data.access_token) {
            return await getOaAccessToken();
        }

        oaAccessToken = res.data.access_token;
        oaAccessTokenExpire = res.data.expires_in * 1000;
    }

    return oaAccessToken;
}

/**
 * 发送小程序订阅消息
 * @param params 消息参数
 * @returns 发送结果
 */
export async function sendMpSubscribeMessage({
    touser,
    template_id,
    page,
    data,
    lang
}: SendSubscribeMessageParams): Promise<SendSubscribeMessageResponse> {
    const access_token = await getUserMpAccessToken();

    const res = await axios.request({
        url: `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
        method: 'POST',
        data: {
            touser,
            template_id,
            page,
            data,
            miniprogram_state: config.debug ? 'developer' : 'formal',
            lang: lang ? lang : 'zh_CN'
        }
    });

    return res.data;
}

/**
 * 发送公众号模板消息
 * @param params 消息参数
 * @returns 发送结果
 */
export async function sendOaTemplateMessage({
    touser,
    template_id,
    miniprogram,
    url,
    data
}: SendOaTemplateMessageParams): Promise<SendSubscribeMessageResponse> {
    const access_token = await getOaAccessToken();

    const res = await axios.request({
        url: `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`,
        method: 'POST',
        data: {
            touser,
            template_id,
            miniprogram,
            url,
            data
        }
    });

    return res.data;
}

// XML数据接口
export interface XmlData {
    [key: string]: any;
}

/**
 * 构建XML字符串
 * @param data 数据对象
 * @param rootName 根节点名称
 * @returns XML字符串
 */
export function buildXML(data: XmlData, rootName = 'xml'): string {
    return new xml2js.Builder({ xmldec: null, rootName, allowSurrogateChars: true, cdata: true }).buildObject(data);
}

/**
 * 解析XML字符串
 * @param xml XML字符串
 * @returns 解析后的数据对象
 */
export async function parseXML(xml: string): Promise<XmlData> {
    return await xml2js.parseStringPromise(xml, { trim: true, explicitArray: false, explicitRoot: false });
}

/**
 * PKCS7解码器
 * @param buff 缓冲区
 * @returns 解码后的缓冲区
 */
function PKCS7Decoder(buff: Buffer) {
    let pad = buff[buff.length - 1];

    if (pad < 1 || pad > 32) {
        pad = 0;
    }

    return buff.slice(0, buff.length - pad);
}

/**
 * 公众号消息解密
 * @param encrypted 加密字符串
 * @returns 解密后的字符串
 */
export function oaDecrypt(encrypted: string): string {
    const aesKey = Buffer.from(config.wechat.oa.key + '=', 'base64');
    const iv = aesKey.slice(0, 16);
    const aesCipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);

    aesCipher.setAutoPadding(false);

    let decipheredBuff = Buffer.concat([aesCipher.update(encrypted, 'base64'), aesCipher.final()]);

    decipheredBuff = PKCS7Decoder(decipheredBuff);

    const len_netOrder_corpid = decipheredBuff.slice(16);
    const msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
    const result = len_netOrder_corpid.slice(4, msg_len + 4).toString();
    const appId = len_netOrder_corpid.slice(msg_len + 4).toString();

    if (appId != config.wechat.oa.appid) {
        return '';
    }

    return result;
}

/**
 * 获取公众号用户信息
 * @param openid 用户openid
 * @returns 用户信息
 */
export async function getOaUserInfo(openid: string): Promise<WechatOaUserInfo> {
    const access_token = await getOaAccessToken();

    const res = await axios.request({
        url: `https://api.weixin.qq.com/cgi-bin/user/info`,
        method: 'get',
        params: {
            openid,
            access_token
        }
    });

    return res.data;
}

/**
 * 创建公众号菜单
 * @param data 菜单数据
 * @returns 创建结果
 */
export async function createOaMenu(data: object): Promise<SendSubscribeMessageResponse> {
    const access_token = await getOaAccessToken();

    const res = await axios.request({
        url: `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${access_token}`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    });

    return res.data;
}

/**
 * 获取公众号模板列表
 * @returns 模板列表
 */
export async function getOaTplList(): Promise<any> {
    const access_token = await getOaAccessToken();

    const res = await axios.request({
        url: `https://api.weixin.qq.com/cgi-bin/template/get_all_private_template?access_token=${access_token}`,
        method: 'get'
    });

    return res.data;
}
