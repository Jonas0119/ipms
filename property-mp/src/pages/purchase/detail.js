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
import $notify from '../../components/notify/notify';
import $toast from '../../components/toast/toast';
import $dialog from '../../components/dialog/dialog';
import { ASSETS_HOST } from '../../config';

IpmsPage({
    data: {
        ASSETS_HOST,
        fetching: true,
        id: null,
        detail: {},
        canceling: false,
        activeCollapse: 0
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
                url: '/purchase/detail',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(
                res => {
                    this.setData({
                        fetching: false,
                        detail: res.data
                    });
                },
                res => {
                    if (res.code === -130) {
                        $notify({
                            type: 'danger',
                            message: '请返回首页修改默认小区后查看'
                        });

                        return setTimeout(() => {
                            wx.redirectTo({ url: '/pages/home/index' });
                        }, 3000);
                    }

                    this.setData({
                        fetching: false,
                        detail: {}
                    });

                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    onApproved(e) {
        const data = {
            id: this.data.id,
            community_id: this.data.postInfo.default_community_id,
            ...e.detail
        };

        utils
            .request({
                url: '/purchase/flow',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id,
                    ...e.detail
                }
            })
            .then(
                res => {
                    this.getDetail();
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    onRelationed(e) {
        utils
            .request({
                url: '/purchase/assign',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id,
                    ...e.detail
                }
            })
            .then(
                res => {
                    this.getDetail();
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    doCancel() {
        $dialog
            .confirm({
                title: '请确认',
                message: '确认要撤销本次采购流程吗？'
            })
            .then(() => {
                this.setData({ canceling: true });
                utils
                    .request({
                        url: '/purchase/cancel',
                        method: 'post',
                        data: {
                            id: this.data.id,
                            community_id: this.data.postInfo.default_community_id
                        }
                    })
                    .then(
                        res => {
                            this.setData({
                                canceling: false,
                                detail: {
                                    ...this.data.detail,
                                    info: {
                                        ...this.data.detail.info,
                                        cancel: 1,
                                        canceled_at: res.data.canceled_at
                                    }
                                }
                            });

                            $notify({
                                type: 'success',
                                message: '撤销采购流程成功'
                            });
                        },
                        res => {
                            $notify({
                                type: 'danger',
                                message: res.message
                            });
                            this.setData({ canceling: false });
                        }
                    );
            })
            .catch(() => {});
    },
    onCollapseChange(e) {
        this.setData({
            activeCollapse: e.detail
        });
    },
    showImg(e) {
        const { src } = e.currentTarget.dataset;

        wx.previewImage({
            current: 0,
            urls: [src]
        });
    }
});
