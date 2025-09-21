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
        try {
            const { template_list: list } = await wechatService.getOaTplList();

            ctx.body = {
                code: SUCCESS,
                data: {
                    list
                }
            };
        } catch (error) {
            console.error('[OA-TPL] 获取模板列表失败:', error.message);
            
            ctx.body = {
                code: 500,
                message: '获取模板列表失败，请稍后重试',
                data: {
                    list: []
                }
            };
        }
    }
};

export default PcOaTplAction;
