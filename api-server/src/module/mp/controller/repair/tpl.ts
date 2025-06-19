/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { MP_REPAIR_ALLOT_TPL, MP_REPAIR_CONFIRM_TPL, MP_REPAIR_FINISH_TPL } from '~/constant/tpl';

const MpRepairTplAction = <Action>{
    router: {
        path: '/repair/tpl',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                dispose_subscribed: MP_REPAIR_ALLOT_TPL,
                confrim_subscribed: MP_REPAIR_CONFIRM_TPL,
                finish_subscribed: MP_REPAIR_FINISH_TPL
            }
        };
    }
};

export default MpRepairTplAction;
