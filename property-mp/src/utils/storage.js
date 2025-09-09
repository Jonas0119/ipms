/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import * as config from '../config';

export function token() {
    return wx.getStorageSync(config.TOKEN_NAME) || null;
}
// 是否登录
export function isLogin() {
    return !!token();
}

export function logout() {
    wx.removeStorageSync(config.TOKEN_NAME);
}

export function login(token) {
    wx.setStorageSync(config.TOKEN_NAME, token);
}

export function userId() {
    return wx.getStorageSync(config.USER_ID) || null;
}

export function setUserId(id) {
    if (id) {
        wx.setStorageSync(config.USER_ID, id);
    } else {
        wx.removeStorageSync(config.USER_ID);
    }
}
