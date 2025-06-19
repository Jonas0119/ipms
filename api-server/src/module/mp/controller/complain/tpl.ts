/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { MP_COMPLAIN_ALLOT_TPL, MP_COMPLAIN_CONFRIM_TPL, MP_COMPLAIN_FINISH_TPL } from '~/constant/tpl';

const MpComplainTplAction = <Action>{
    router: {
        path: '/complain/tpl',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                dispose_subscribed: MP_COMPLAIN_ALLOT_TPL,
                confrim_subscribed: MP_COMPLAIN_CONFRIM_TPL,
                finish_subscribed: MP_COMPLAIN_FINISH_TPL
            }
        };
    }
};

export default MpComplainTplAction;
