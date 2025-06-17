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

const PcBuildingTemplateAction = <Action>{
    router: {
        path: '/building/template',
        method: 'get',
        authRequired: true,
        roles: [ROLE.FCDA]
    },
    response: async ctx => {
        try {
            // 使用新的模板服务，保持向后兼容
            const exists = await TemplateService.templateExists('building_import');
            if (!exists) {
                ctx.status = 404;
                ctx.body = {
                    code: 404,
                    message: '模板文件不存在'
                };
                return;
            }

            // 获取模板配置
            const templateConfig = TemplateService.getTemplateConfig();
            const template = templateConfig.templates['building_import'];

            // 如果有直链，重定向到直链
            if (template && template.directUrl) {
                ctx.redirect(template.directUrl);
                return;
            }

            // 否则通过服务端下载
            const fileStream = await TemplateService.getTemplateStream('building_import');
            if (!fileStream) {
                ctx.status = 404;
                ctx.body = {
                    code: 404,
                    message: '模板文件读取失败'
                };
                return;
            }

            // 设置响应头
            ctx.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="固定资产导入模板.xlsx"'
            });

            // 返回文件流
            ctx.body = fileStream as any;
        } catch (error) {
            console.error('Building template download error:', error);
            ctx.status = 500;
            ctx.body = {
                code: 500,
                message: '模板下载失败: ' + (error.message || '未知错误')
            };
        }
    }
};

export default PcBuildingTemplateAction;
