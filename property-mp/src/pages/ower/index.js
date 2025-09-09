/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { IpmsPage } from '../common/page';

IpmsPage({
    data: {
        owerInfo: {},
        buildings: []
    },
    onLoad() {
        const res = wx.getStorageSync('OWER_INFO');

        if (!res) {
            return wx.navigateTo({
                url: '/pages/home/index'
            });
        }

        try {
            const cardInfo = JSON.parse(res);
            this.setData({
                owerInfo: cardInfo,
                buildings: [].concat(
                    cardInfo.houses,
                    cardInfo.merchants,
                    cardInfo.carports,
                    cardInfo.garages,
                    cardInfo.warehouses
                )
            });
        } catch (e) {
            wx.navigateTo({
                url: '/pages/home/index'
            });
        }
    }
});
