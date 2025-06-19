/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { MP_MOVE_CAR_TPL } from '~/constant/tpl';

const MpMoveCarTplAction = <Action>{
    router: {
        path: '/move_car/tpl',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                subscribed: MP_MOVE_CAR_TPL
            }
        };
    }
};

export default MpMoveCarTplAction;
