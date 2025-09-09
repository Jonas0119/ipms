/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import utils from '../../utils/index';

CwPage({
    data: {
        fetching: true,
        detail: {}
    },
    onLoad(opts) {
        // opts.id = 1;
        utils
            .request({
                url: `/topic/detail/${opts.id}`,
                method: 'get'
            })
            .then(res => {
                wx.setNavigationBarTitle({ title: res.data.title });

                this.setData({
                    fetching: false,
                    detail: res.data
                });
            });
    }
});
