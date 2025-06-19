/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import { StorageServiceFactory } from '~/service/storage/storage-factory';
import { LocalStorageService } from '~/service/storage/local-storage';

const MpUploadLocalAction = <Action>{
    router: {
        path: '/upload/local',
        method: 'post',
        authRequired: true
    },

    response: async ctx => {
        try {
            // 只有在本地模式下才允许使用此接口
            if (!StorageServiceFactory.isLocalMode()) {
                ctx.body = {
                    code: DATA_MODEL_UPDATE_FAIL,
                    message: '当前不支持本地上传模式'
                };
                return;
            }

            const service = StorageServiceFactory.getStorageService() as LocalStorageService;
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
