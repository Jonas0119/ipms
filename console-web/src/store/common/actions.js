/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import * as utils from '@/utils';
import * as mutationTypes from '@/constants/mutationTypes';
import router from '@/router';

export default {
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
