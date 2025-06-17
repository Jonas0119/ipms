/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
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
