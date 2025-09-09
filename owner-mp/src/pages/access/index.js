/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

CwPage({
    data: {
        fetching: true,
        cardList: [],
        entranceList: [],
        activeTab: 0
    },
    onGlobalDataUpdate() {
        const { communityInfo } = this.data;

        if (
            communityInfo.current.access_nfc ||
            communityInfo.current.access_qrcode ||
            communityInfo.current.access_remote
        ) {
            const building_ids = communityInfo.current.houses.map(item => item.building_id);

            utils
                .request({
                    url: '/access/list',
                    method: 'post',
                    data: {
                        building_ids,
                        community_id: communityInfo.current.community_id
                    }
                })
                .then(res => {
                    this.setData({
                        fetching: false,
                        cardList: res.data.cardList,
                        entranceList: res.data.entranceList
                    });
                });
        } else {
            this.setData({ fetching: false });
        }
    },
    onTabChange(e) {
        this.setData({
            activeTab: e.detail.index
        });
    },
    openDoor(e) {
        const { id } = e.currentTarget.dataset;

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '提交中…'
        });

        utils
            .request({
                url: '/access/door',
                method: 'post',
                data: {
                    id,
                    community_id: this.data.communityInfo.current.community_id
                }
            })
            .then(
                res => {
                    $toast.clear();
                    $notify({
                        type: 'success',
                        message: res.message
                    });
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
