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
import { StorageServiceFactory } from '~/service/storage/storage-factory';
import config from '~/config';

const PcStorageUploadAction = <Action>{
    router: {
        path: '/storage/upload',
        method: 'post',
        authRequired: config.inited
    },

    response: async ctx => {
        try {
            const storageService = StorageServiceFactory.getStorageService();

            // 检查是否支持服务端上传
            if (!storageService.handleFileUpload) {
                ctx.body = {
                    code: DATA_MODEL_UPDATE_FAIL,
                    message: '当前存储模式不支持服务端上传'
                };
                return;
            }

            const result = await storageService.handleFileUpload(ctx);

            ctx.body = {
                code: SUCCESS,
                data: {
                    success: true,
                    url: result.url,
                    key: result.key
                }
            };
        } catch (error) {
            console.error('Storage upload error:', error);
            ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: error.message || '文件上传失败'
            };
        }
    }
};

export default PcStorageUploadAction;
