/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import communityService from '~/service/community';
import utils from '~/utils';

const MpUserInfoAction = <Action>{
    router: {
        path: '/user/info',
        method: 'get',
        authRequired: true
    },

    response: async ctx => {
        const communityInfo = await communityService(ctx.model, ctx.mpUserInfo.id);
        const info = { ...ctx.mpUserInfo };

        delete info.real_name;
        delete info.idcard;

        info.phone = utils.phone.hide(info.phone);

        ctx.body = {
            code: SUCCESS,
            data: {
                userInfo: info,
                communityInfo
            }
        };
    }
};

export default MpUserInfoAction;
