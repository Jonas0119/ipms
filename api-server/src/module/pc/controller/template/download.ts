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

interface RequestParams {
    templateType: string;
}

const PcTemplateDownloadAction = <Action>{
    router: {
        path: '/template/download/:templateType',
        method: 'get',
        authRequired: true,
        roles: [ROLE.FCDA] // 房产数据管理员权限
    },
    validator: {
        params: [
            {
                name: 'templateType',
                required: true,
                regex: /^[a-zA-Z_]+$/
            }
        ]
    },
    response: async ctx => {
        const { templateType } = <RequestParams>ctx.params;

        try {
            // 检查模板是否存在
            const exists = await TemplateService.templateExists(templateType);
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
            const template = templateConfig.templates[templateType];

            if (!template) {
                ctx.status = 404;
                ctx.body = {
                    code: 404,
                    message: '模板类型不存在'
                };
                return;
            }

            // 如果有直链，重定向到直链
            if (template.directUrl) {
                ctx.redirect(template.directUrl);
                return;
            }

            // 否则通过服务端下载
            const fileStream = await TemplateService.getTemplateStream(templateType);
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
                'Content-Disposition': `attachment; filename="${encodeURIComponent(template.name)}"`
            });

            // 返回文件流
            ctx.body = fileStream as any;
        } catch (error) {
            console.error('Template download error:', error);
            ctx.status = 500;
            ctx.body = {
                code: 500,
                message: '模板下载失败: ' + (error.message || '未知错误')
            };
        }
    }
};

export default PcTemplateDownloadAction;
