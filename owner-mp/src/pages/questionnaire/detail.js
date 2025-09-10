/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { IpmsPage } from '../common/page';
import utils from '../../utils/index';

IpmsPage({
    data: {
        id: null,
        fetching: true,
        questions: [],
        title: null,
        expire: null,
        statistics: {}
    },
    onLoad(opts) {
        // opts.id = 1;

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
        utils
            .request({
                url: `/questionnaire/detail/${this.data.id}`,
                method: 'get'
            })
            .then(res => {
                wx.setNavigationBarTitle({ title: res.data.title });

                this.setData({
                    fetching: false,
                    ...res.data
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    }
});
