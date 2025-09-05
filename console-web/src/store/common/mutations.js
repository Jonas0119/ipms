/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import * as mutationTypes from '@/constants/mutationTypes';

export default {
    // 合并后端返回的 userInfo/postInfo，并生成页面水印（基于用户与默认社区）
    [mutationTypes.UPDATE_USERINFO](state, data) {
        state.userInfo = Object.assign(state.userInfo, data.userInfo);
        state.postInfo = Object.assign(state.postInfo, data.postInfo);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 664;
        canvas.height = 372;

        ctx.translate(0, canvas.height / 3);
        ctx.rotate((-20 * Math.PI) / 180);
        ctx.font = '28px STXihei, "华文细黑", "Microsoft YaHei", "微软雅黑"';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'Middle';

        let name = '';

        data.postInfo.community_list.every(item => {
            if (item.community_id === data.postInfo.default_community_id) {
                name = item.name;
                return false;
            }
            return true;
        });

        ctx.fillText(`${name}小区${data.userInfo.real_name}`, canvas.width / 2, canvas.height / 2);

        state.waterMark = canvas.toDataURL('image/png');
    },
    // 将新通知追加到未读列表头部（与 Topbar 通知下拉联动）
    [mutationTypes.PUSH_UNREAD_NOTICES](state, data) {
        state.unreadNotices = [].concat(data, state.unreadNotices);
    },
    // 清空全部未读
    [mutationTypes.CLEAR_UNREAD_NOTICES](state) {
        state.unreadNotices = [];
    },
    // 清空单条未读（按 id）
    [mutationTypes.CLEAR_UNREAD_NOTICE](state, id) {
        const notices = [].concat(state.unreadNotices);

        notices.splice(
            notices.findIndex(item => item.id === id),
            1
        );

        state.unreadNotices = notices;
    }
};
