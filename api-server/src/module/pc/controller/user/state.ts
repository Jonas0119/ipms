/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as uuid from 'uuid';
import config from '~/config';

const PcUserStateAction = <Action>{
    router: {
        path: '/user/state',
        method: 'get',
        authRequired: false
    },

    response: async ctx => {
        ctx.session.state = uuid.v4();

        ctx.body = {
            code: SUCCESS,
            data: {
                state: ctx.session.state,
                expire: config.session.maxAge
            }
        };
    }
};

export default PcUserStateAction;
