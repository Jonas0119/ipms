/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { IpmsPage } from '../common/page';
import utils from '../../utils/index';

IpmsPage({
    data: {
        fetching: true,
        car_number: null,
        list: []
    },
    onLoad(opt) {
        this.setData({
            car_number: opt.car_number
        });
    },
    onGlobalDataUpdate() {
        this.getDetail();
    },
    getDetail() {
        if (!this.data.postInfo.default_community_id) {
            return Promise.resolve(); // Fixed: changed from reject to resolve to prevent uncaught promise rejection
        }

        this.setData({
            fetching: true
        });

        return utils
            .request({
                url: '/move_car/find',
                method: 'post',
                data: {
                    car_number: this.data.car_number,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    list: res.data.list
                });
            });
    },
    makeCell(e) {
        const { phone } = e.currentTarget.dataset;

        wx.makePhoneCall({
            phoneNumber: phone,
            fail: () => {}
        });
    }
});
