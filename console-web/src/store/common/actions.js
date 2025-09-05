/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import * as utils from '@/utils';
import * as mutationTypes from '@/constants/mutationTypes';
import router from '@/router';

export default {
    // 获取当前登录用户与岗位信息：
    // - 由 views/app/index.vue 在首屏或路由切换时按需触发
    // - 统一通过 utils.request.get('/user/info') 调用后端 /pc/user/info
    // - 根据返回的 postInfo 与路由 meta.accessRequired 做一次前端侧的权限兜底
    fetchUserInfo(context) {
        utils.request
            .get('/user/info')
            .then(res => {
                if (
                    !res.data.postInfo.job &&
                    !res.data.postInfo.is_admin &&
                    router.history.current.meta.accessRequired
                ) {
                    utils.auth.logout();
                    return router.replace('/login');
                }

                context.commit(mutationTypes.UPDATE_USERINFO, res.data);
            })
            .catch(() => {});
    },
    updateUserInfo(context, data) {
        context.commit(mutationTypes.UPDATE_USERINFO, data);
    },
    clearUnreadNotices(context) {
        context.commit(mutationTypes.CLEAR_UNREAD_NOTICES);
    },
    clearUnreadNotice(context, id) {
        context.commit(mutationTypes.CLEAR_UNREAD_NOTICE, id);
    },
    pushUnreadNotices(context, data) {
        context.commit(mutationTypes.PUSH_UNREAD_NOTICES, data);
    }
};
