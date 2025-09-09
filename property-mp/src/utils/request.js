/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import * as config from '../config';
import * as storage from './storage';

function request({ url, data, method }) {
    const fullUrl = `${config.API_HOST}/pc${url}`;
    const headers = {
        ['ipms-pc-token']: storage.token(),
        ['wechat-mp-request']: 'true'
    };
    
    console.log('[Request-DEBUG] 🚀 发起网络请求:');
    console.log('[Request-DEBUG] 🌐 完整URL:', fullUrl);
    console.log('[Request-DEBUG] 📋 请求方法:', method);
    console.log('[Request-DEBUG] 📤 请求数据:', data);
    console.log('[Request-DEBUG] 📋 请求头:', headers);
    
    return new Promise((resolve, reject) => {
        wx.request({
            url: fullUrl,
            header: headers,
            data,
            dataType: 'json',
            method,
            success: res => {
                console.log('[Request-DEBUG] 📥 收到响应:');
                console.log('[Request-DEBUG] 📊 状态码:', res.statusCode);
                console.log('[Request-DEBUG] 📋 响应头:', res.header);
                console.log('[Request-DEBUG] 📥 响应数据:', res.data);
                if (res.statusCode === 401) {
                    storage.logout();
                    const pages = getCurrentPages();

                    if (pages.length === 0) {
                        const { route, options } = pages[pages.length - 1];
                        const query = [];
                        for (let key in options) {
                            query.push(`${key}=${options[key]}`);
                        }
                        const redirect = encodeURIComponent(`/${route}${query.length ? '?' : ''}${query.join('&')}`);

                        return wx.redirectTo({
                            url: `/pages/login/index?redirect=${redirect}`
                        });
                    } else {
                        return wx.redirectTo({
                            url: '/pages/login/index'
                        });
                    }
                }

                switch (res.statusCode) {
                    case 400:
                        res.data = { message: '错误请求' };
                        break;

                    case 403:
                        res.data = { message: '权限不足，拒绝访问' };
                        break;
                    case 404:
                        res.data = { message: '请求错误，未找到该资源' };
                        break;
                    case 405:
                        res.data = { message: '请求方法未允许' };
                        break;
                    case 408:
                        res.data = { message: '请求超时' };
                        break;
                    case 500:
                        res.data = { message: '服务器端出错' };
                        break;
                    case 501:
                        res.data = { message: '网络未实现' };
                        break;
                    case 502:
                        res.data = { message: '网络错误' };
                        break;
                    case 503:
                        res.data = { message: '服务不可用' };
                        break;
                    case 504:
                        res.data = { message: '网络超时' };
                        break;
                    case 505:
                        res.data = { message: 'http版本不支持该请求' };
                        break;
                }

                if (res.data.code === 200 && res.statusCode === 200) {
                    console.log('[Request-DEBUG] ✅ 请求成功:', res.data);
                    resolve(res.data);
                } else {
                    console.error('[Request-DEBUG] ❌ 请求失败:');
                    console.error('[Request-DEBUG] ❌ 状态码:', res.statusCode);
                    console.error('[Request-DEBUG] ❌ 业务码:', res.data?.code);
                    console.error('[Request-DEBUG] ❌ 错误信息:', res.data?.message);
                    reject(res.data);
                }
            },
            fail: res => {
                console.error('[Request-DEBUG] ❌ 网络请求失败:');
                console.error('[Request-DEBUG] ❌ 错误信息:', res.errMsg);
                console.error('[Request-DEBUG] ❌ 完整错误:', res);
                reject({ message: res.errMsg });
                // wx.navigateTo({
                //     url: '/pages/error/network'
                // });
            }
        });
    });
}

export default request;
