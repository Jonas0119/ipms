/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TemplateService } from '~/service/template';

const PcTemplateConfigAction = <Action>{
    router: {
        path: '/template/config',
        method: 'get',
        authRequired: true,
        roles: [ROLE.ANYONE]
    },
    response: async ctx => {
        try {
            const templateConfig = TemplateService.getTemplateConfig();

            ctx.body = {
                code: SUCCESS,
                data: templateConfig
            };
        } catch (error) {
            console.error('Get template config error:', error);
            ctx.body = {
                code: SUCCESS,
                data: { templates: {} },
                message: '获取模板配置失败'
            };
        }
    }
};

export default PcTemplateConfigAction;
