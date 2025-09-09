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
        id: null,
        fetching: true,
        loaded: false,
        detail: {}
    },
    onGlobalDataUpdate() {
        this.loadData();
    },
    onLoad(opts) {
        // opts.id = 4;
        this.setData(
            {
                id: opts.id
            },
            () => {
                this.loadData();
            }
        );
    },
    loadData() {
        if (!this.data.id || !this.data.postInfo.default_community_id || this.data.loaded) {
            return;
        }

        this.setData({ loaded: true });

        utils
            .request({
                url: '/ower/detail',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    },
    makePhone(e) {
        const { phone } = e.currentTarget.dataset;

        wx.makePhoneCall({
            phoneNumber: phone,
            fail: () => {}
        });
    }
});
