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
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import { uploadService } from '~/service/upload';
import { LocalUploadService } from '~/service/upload/local-upload';

const MpUploadLocalAction = <Action>{
    router: {
        path: '/upload/local',
        method: 'post',
        authRequired: true
    },

    response: async ctx => {
        try {
            // 只有在本地模式下才允许使用此接口
            if (!uploadService.isLocalMode()) {
                ctx.body = {
                    code: DATA_MODEL_UPDATE_FAIL,
                    message: '当前不支持本地上传模式'
                };
                return;
            }

            const service = uploadService.getUploadService() as LocalUploadService;
            const result = await service.handleFileUpload(ctx);

            ctx.body = {
                code: SUCCESS,
                data: result
            };
        } catch (error) {
            ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: error.message || '文件上传失败'
            };
        }
    }
};

export default MpUploadLocalAction;
