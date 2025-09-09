/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { IpmsPage } from '../common/page';
import $notify from '../../components/notify/notify';
import utils from '../../utils/index';

IpmsPage({
    data: {
        loading: false,
        redirect: null,
        loginCode: undefined
    },
    timer: null, // 添加定时器变量
    onLoad(opts) {
        this.setData({
            redirect: opts.redirect ? decodeURIComponent(opts.redirect) : null
        });
    },
    onShow() {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }

        this.getLoginCode();
    },
    getLoginCode() {
        wx.login({
            success: ({ code }) => {
                this.setData({ loginCode: code });

                if (!this.data.phone) {
                    this.timer = setTimeout(() => {
                        this.getLoginCode();
                    }, 4.5 * 60 * 1000); // 修正时间：4.5分钟 = 4.5 * 60 * 1000毫秒
                } else {
                    this.clearGetLoginCode();
                }
            }
        });
    },
    clearGetLoginCode() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    },
    onUnload() {
        // 页面卸载时清除定时器
        this.clearGetLoginCode();
    },
    getPhoneNumber(e) {
        const { loading } = this.data;

        if (loading) {
            return;
        }

        if (e.detail.errMsg !== 'getPhoneNumber:ok') {
            return $notify({
                customNavBar: true,
                type: 'danger',
                message: '登录失败，请重试'
            });
        }

        this.setData({
            loading: true
        });

        const { brand, model, system, platform } = this.data.systemInfo;

        utils
            .request({
                url: '/user/mp_login',
                method: 'post',
                data: {
                    brand,
                    model,
                    system,
                    platform,
                    code: this.data.loginCode,
                    encryptedData: e.detail.encryptedData,
                    iv: e.detail.iv
                }
            })
            .then(
                res => {
                    this.setData({
                        loading: false
                    });

                    this.bridge.updateData({
                        userInfo: res.data.userInfo,
                        postInfo: res.data.postInfo,
                        globalFetching: false
                    });

                    utils.storage.login(res.data.token);
                    utils.storage.setUserId(res.data.userInfo.id);

                    wx.redirectTo({
                        url: this.data.redirect == null ? '/pages/home/index' : this.data.redirect
                    });
                },
                res => {
                    this.setData({
                        loading: false
                    });
                    return $notify({
                        customNavBar: true,
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    }
});
