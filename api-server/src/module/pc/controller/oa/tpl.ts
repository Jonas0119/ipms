/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import * as wechatService from '~/service/wechat';
import { SUCCESS } from '~/constant/code';

const PcOaTplAction = <Action>{
    router: {
        path: '/oa/tpl',
        method: 'get',
        authRequired: true,
        roles: []
    },
    response: async ctx => {
        const { template_list: list } = await wechatService.getOaTplList();

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcOaTplAction;
