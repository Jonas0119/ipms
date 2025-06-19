/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { MP_OWNER_APPROVE } from '~/constant/tpl';

const MpApplyTplAction = <Action>{
    router: {
        path: '/apply/tpl',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                subscribed: MP_OWNER_APPROVE
            }
        };
    }
};

export default MpApplyTplAction;
