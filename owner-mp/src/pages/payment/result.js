/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { IpmsPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

let timer = null;

IpmsPage({
    data: {
        success: false,
        id: null
    },
    onHide() {
        if (timer !== null) {
            clearInterval(timer);
            wx.redirectTo({ url: `/pages/payment/detail?id=${id}` });
        }
    },
    onLoad(opts) {
        this.setData(
            {
                id: parseInt(opts.id, 10)
            },
            () => {
                timer = setInterval(() => {
                    this.getResult();
                }, 2000);
            }
        );
    },
    getResult() {
        const { id } = this.data;

        utils
            .request({
                url: `/payment/result/${id}`,
                method: 'get'
            })
            .then(res => {
                if (res.data.result) {
                    this.setData({ success: true });
                    timer = null;
                    clearInterval(timer);
                }
            });
    },
    goDetail() {
        const { id } = this.data;

        wx.redirectTo({ url: `/pages/payment/detail?id=${id}` });
    }
});
