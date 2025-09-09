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
        activeTabIndex: 0,
        approver_fetching: true,
        notice_fetching: true,
        approver_page_num: 1,
        notice_page_num: 1,
        approver_page_amount: 0,
        notice_page_amount: 0,
        approver_list: [],
        notice_list: [],
        page_size: 5
    },
    onLoad() {
        this.setData({
            page_size: Math.ceil(this.data.systemInfo.windowHeight / 180)
        });
    },
    onGlobalDataUpdate() {
        this.loadMyData(1);
        this.loadSelfData(1);
    },
    loadMyData(page_num) {
        if (this.data.approver_fetching && page_num > 1) {
            return Promise.resolve(); // Fixed: changed from reject to resolve to prevent uncaught promise rejection
        }

        this.setData({
            approver_fetching: true,
            approver_list: page_num === 1 ? [] : this.data.approver_list
        });

        return utils
            .request({
                url: '/refound/approver',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    approver_fetching: false,
                    approver_page_num: res.data.page_num,
                    approver_page_amount: res.data.page_amount,
                    approver_list: page_num === 1 ? res.data.list : [].concat(this.data.approver_list, res.data.list)
                });
            });
    },
    loadSelfData(page_num) {
        if (this.data.notice_fetching && page_num > 1) {
            return Promise.resolve(); // Fixed: changed from reject to resolve to prevent uncaught promise rejection
        }

        this.setData({
            notice_fetching: true,
            notice_list: page_num === 1 ? [] : this.data.notice_list
        });

        return utils
            .request({
                url: '/refound/notice',
                method: 'post',
                data: {
                    page_num,
                    page_size: this.data.page_size,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    notice_fetching: false,
                    notice_page_num: res.data.page_num,
                    notice_page_amount: res.data.page_amount,
                    notice_list: page_num === 1 ? res.data.list : [].concat(this.data.notice_list, res.data.list)
                });
            });
    },
    onTabChange(e) {
        this.setData({ activeTabIndex: e.detail.index });
    },
    // 下拉刷新
    onReachBottom() {
        const {
            activeTabIndex,
            approver_page_num,
            approver_page_amount,
            notice_page_num,
            notice_page_amount
        } = this.data;

        if (activeTabIndex === 0) {
            if (approver_page_num < approver_page_amount) {
                this.loadMyData(approver_page_num + 1);
            }
        } else {
            if (notice_page_num < notice_page_amount) {
                this.loadSelfData(notice_page_num + 1);
            }
        }
    },
    onPullDownRefresh() {
        Promise.all([this.loadMyData(1), this.loadSelfData(1)]).then(() => {
            wx.stopPullDownRefresh();
        });
    }
});
