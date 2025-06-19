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
            // 获取模板配置
            const templateConfig = TemplateService.getTemplateConfig();
            const template = templateConfig.templates['building_import'];

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
                console.log(`Building template redirecting to direct URL: ${template.directUrl}`);
                ctx.redirect(template.directUrl);
                return;
            }

            // 检查模板是否存在
            const exists = await TemplateService.templateExists('building_import');
            if (!exists) {
                ctx.status = 404;
                ctx.body = {
                    code: 404,
                    message: '模板文件不存在'
                };
                return;
            }

            // 尝试通过服务端下载
            const fileStream = await TemplateService.getTemplateStream('building_import');
            if (fileStream) {
                // 设置响应头
                ctx.set({
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': 'attachment; filename="固定资产导入模板.xlsx"'
                });

                // 返回文件流
                ctx.body = fileStream as any;
                return;
            }

            // 对于云存储（如MinIO），如果无法获取文件流，返回详细的错误信息
            ctx.status = 500;
            ctx.body = {
                code: 500,
                message:
                    'MinIO模式下模板文件下载失败，请检查MinIO服务是否正常运行，或确保模板文件已正确上传到存储桶的template目录中'
            };
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
