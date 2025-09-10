/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { IpmsPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

IpmsPage({
    data: {
        fetching: true,
        list: []
    },
    onGlobalDataUpdate() {
        this.loadData();
    },
    loadData() {
        utils
            .request({
                url: `/payment/order/${this.data.communityInfo.current.community_id}`,
                method: 'get'
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    list: res.data.list
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    },
    goPayment(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({ url: `/pages/payment/detail?id=${id}&paynow=1` });
    },
    doCreate(e) {
        const { data, id } = e.currentTarget.dataset;

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '生成订单…'
        });

        utils
            .request({
                url: '/payment/create',
                method: 'post',
                data: {
                    building_ids: data.map(item => item.building_id),
                    fee_id: id
                }
            })
            .then(
                res => {
                    $toast.clear();
                    wx.navigateTo({ url: `/pages/payment/detail?id=${res.data.order_id}&paynow=1` });
                },
                res => {
                    $toast.clear();
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    }
});
