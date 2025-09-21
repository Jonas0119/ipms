/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import axios from 'axios';
import config from '~/config';
import kjhlog from '~/utils/kjhlog';
import crypto from 'crypto';

interface Loaction {
    lat: number;
    lng: number;
}

/**
 * 计算腾讯地图API签名
 * @param path 请求路径，如：/ws/location/v1/ip
 * @param params 请求参数对象
 * @param secretKey SecretKey (SK)
 * @returns 签名结果
 */
function calculateSignature(path: string, params: Record<string, any>, secretKey: string): string {
    // 1. 过滤掉undefined和null的参数
    const filteredParams: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            filteredParams[key] = value;
        }
    }

    // 2. 按参数名升序排序
    const sortedKeys = Object.keys(filteredParams).sort();
    
    // 3. 拼接参数字符串
    const paramString = sortedKeys
        .map(key => `${key}=${filteredParams[key]}`)
        .join('&');

    // 4. 拼接完整字符串：请求路径 + "?" + 请求参数 + SecretKey
    const signString = `${path}?${paramString}${secretKey}`;
    
    kjhlog.info(`[MAP-SIGNATURE] 签名计算字符串: ${signString}`);
    
    // 5. 计算MD5值（小写）
    const signature = crypto.createHash('md5').update(signString).digest('hex');
    
    kjhlog.info(`[MAP-SIGNATURE] 计算得到签名: ${signature}`);
    
    return signature;
}

/**
 * 判断IP是否为局域网IP
 * @param ip IP地址
 * @returns 是否为局域网IP
 */
function isPrivateIP(ip: string): boolean {
    // 检查是否为本地回环地址
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
        return true;
    }
    
    // 检查是否为IPv4局域网地址
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipv4Regex);
    
    if (match) {
        const [, a, b, c, d] = match.map(Number);
        
        // 检查是否为有效的IPv4地址
        if (a > 255 || b > 255 || c > 255 || d > 255) {
            return true; // 无效IP视为局域网IP
        }
        
        // 局域网IP范围：
        // 10.0.0.0 - 10.255.255.255
        // 172.16.0.0 - 172.31.255.255
        // 192.168.0.0 - 192.168.255.255
        // 169.254.0.0 - 169.254.255.255 (链路本地地址)
        return (
            (a === 10) ||
            (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && b === 168) ||
            (a === 169 && b === 254)
        );
    }
    
    // 检查是否为IPv6本地地址
    if (ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) {
        return true;
    }
    
    // 其他情况视为公网IP
    return false;
}

/**
 * 为腾讯地图API请求添加签名参数
 * @param path 请求路径
 * @param params 原始参数
 * @returns 包含签名的参数对象
 */
function addSignatureToParams(path: string, params: Record<string, any>): Record<string, any> {
    // 检查是否启用签名验证
    if (!config.map.enableSignature || !config.map.secretKey) {
        kjhlog.info(`[MAP-SIGNATURE] 签名验证未启用或SecretKey未配置，跳过签名计算`);
        return params;
    }

    // 计算签名
    const signature = calculateSignature(path, params, config.map.secretKey);
 
    kjhlog.info(`[MAP-SIGNATURE] 计算得到签名: ${signature}`);
    kjhlog.info(`[MAP-SIGNATURE] 原来的参数: ${params}`);
    // 添加签名参数
    return {
        ...params,
        sig: signature
    };
}

export async function getLocation(ip: string): Promise<Loaction> {
    kjhlog.info(`[MAP-DEBUG] 开始获取IP位置信息，IP: ${ip}, Map Key: ${config.map.key}, 签名验证: ${config.map.enableSignature ? '已启用' : '未启用'}`);
    
    // 检查API Key是否有效
    if (!config.map.key || config.map.key === 'your_tencent_map_key' || config.map.key.length < 10) {
        kjhlog.warn(`[MAP-DEBUG] 地图API Key无效或未配置，使用默认位置`);
        return { lat: 43.26624, lng: 117.54421 };
    }
    
    try {
        // 准备请求参数
        const requestParams = {
            key: config.map.key,
            ip: isPrivateIP(ip) ? undefined : ip
        };
        
        kjhlog.info(`[MAP-DEBUG] IP地址判断: ${ip} -> ${isPrivateIP(ip) ? '局域网IP，不传递' : '公网IP，传递'}`);
        
        // 添加签名参数
        const paramsWithSignature = addSignatureToParams('/ws/location/v1/ip', requestParams);
        
        kjhlog.info(`[MAP-DEBUG] IP定位API请求参数:`, JSON.stringify(paramsWithSignature, null, 2));
        
        const res = await axios({
            url: 'https://apis.map.qq.com/ws/location/v1/ip',
            params: paramsWithSignature,
            method: 'get',
            timeout: 5000 // 5秒超时
        });

        kjhlog.info(`[MAP-DEBUG] 腾讯地图API响应:`, JSON.stringify(res.data, null, 2));

        if (res.data.status === 0) {
            kjhlog.info(`[MAP-DEBUG] 成功获取位置信息: lat=${res.data.result.location.lat}, lng=${res.data.result.location.lng}`);
            return res.data.result.location;
        } else {
            kjhlog.warn(`[MAP-DEBUG] 腾讯地图API返回错误状态: ${res.data.status}, 消息: ${res.data.message || '未知错误'}`);
            
            // 处理各种错误状态
            switch (res.data.status) {
                case 111:
                    kjhlog.error(`[MAP-DEBUG] API Key签名验证失败，请检查SecretKey是否正确或签名计算是否有误`);
                    break;
                case 110:
                    kjhlog.error(`[MAP-DEBUG] 请求来源未被授权，请检查域名白名单配置`);
                    break;
                case 112:
                    kjhlog.error(`[MAP-DEBUG] IP未被授权，请检查IP白名单配置`);
                    break;
                default:
                    kjhlog.error(`[MAP-DEBUG] 腾讯地图API调用失败，状态码: ${res.data.status}`);
            }
        }
    } catch (error) {
        kjhlog.error(`[MAP-DEBUG] 调用腾讯地图API失败:`, error.message);
    }

    kjhlog.info(`[MAP-DEBUG] 使用默认位置: lat=43.26624, lng=117.54421`);
    return { lat: 43.26624, lng: 117.54421 };
}

export function distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const radLat1 = (lat1 * Math.PI) / 180.0;
    const radLat2 = (lat2 * Math.PI) / 180.0;
    const a = radLat1 - radLat2;
    const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
    let s =
        2 *
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
            )
        );
    s = s * 6378.137;

    return Math.abs(Math.round(s * 10000) / 10);
}

interface searchParams {
    keyword?: string;
    boundary: string;
    category?: string;
    page_size: number;
    page_index: number;
}

interface searchResultParams {
    id: string;
    title: string;
    address: string;
    tel: string;
    category: string;
    type: number;
    location: Loaction;
    _distance: number;
}

interface searchResult {
    status: number;
    count: number;
    data: searchResultParams[];
}

export async function search(params: searchParams): Promise<searchResult> {
    const { keyword, boundary, category, page_size, page_index } = params;

    kjhlog.info(`[MAP-DEBUG] 开始搜索地点，参数:`, JSON.stringify(params, null, 2), `签名验证: ${config.map.enableSignature ? '已启用' : '未启用'}`);

    try {
        // 准备请求参数
        const requestParams = {
            keyword: keyword ? keyword : undefined,
            boundary,
            filter: `category=${category}&tel<>null`,
            page_size,
            page_index,
            key: config.map.key
        };
        
        // 添加签名参数
        const paramsWithSignature = addSignatureToParams('/ws/place/v1/search', requestParams);
        
        kjhlog.info(`[MAP-DEBUG] 地点搜索API请求参数:`, JSON.stringify(paramsWithSignature, null, 2));
        
        const res = await axios({
            url: 'https://apis.map.qq.com/ws/place/v1/search',
            params: paramsWithSignature,
            method: 'get'
        });

        kjhlog.info(`[MAP-DEBUG] 地点搜索API响应:`, JSON.stringify(res.data, null, 2));

        if (res.data.status !== 0) {
            kjhlog.warn(`[MAP-DEBUG] 地点搜索API返回错误状态: ${res.data.status}, 消息: ${res.data.message || '未知错误'}`);
            
            // 处理各种错误状态
            switch (res.data.status) {
                case 111:
                    kjhlog.error(`[MAP-DEBUG] 地点搜索API Key签名验证失败，请检查SecretKey是否正确或签名计算是否有误`);
                    break;
                case 110:
                    kjhlog.error(`[MAP-DEBUG] 地点搜索请求来源未被授权，请检查域名白名单配置`);
                    break;
                case 112:
                    kjhlog.error(`[MAP-DEBUG] 地点搜索IP未被授权，请检查IP白名单配置`);
                    break;
                default:
                    kjhlog.error(`[MAP-DEBUG] 地点搜索API调用失败，状态码: ${res.data.status}`);
            }
            
            // 如果是签名相关错误，不进行重试，直接抛出错误
            if (res.data.status === 111 || res.data.status === 110 || res.data.status === 112) {
                throw new Error(`地点搜索API调用失败: ${res.data.message || '未知错误'}`);
            }
            
            // 其他错误进行重试
            return await search(params);
        }

        kjhlog.info(`[MAP-DEBUG] 成功搜索到 ${res.data.count} 个地点`);
        return res.data;
    } catch (error) {
        kjhlog.error(`[MAP-DEBUG] 调用地点搜索API失败:`, error.message);
        throw error;
    }
}
