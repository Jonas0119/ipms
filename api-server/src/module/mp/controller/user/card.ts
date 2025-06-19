/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import utils from '~/utils';

const MpUserCardAction = <Action>{
    router: {
        path: '/user/card',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },

    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                uid: utils.crypto.encrypt(`${ctx.mpUserInfo.id}-${Date.now()}`)
            }
        };
    }
};

export default MpUserCardAction;
