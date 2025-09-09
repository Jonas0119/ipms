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
import { ROLES } from '../../constants/role';

IpmsPage({
    data: {
        fetching: true,
        id: null,
        detail: {},
        ROLES
    },
    onLoad(opt) {
        this.setData({
            id: parseInt(opt.id, 10)
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
                url: '/vistor/detail',
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
            });
    }
});
