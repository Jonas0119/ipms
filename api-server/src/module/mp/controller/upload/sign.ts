/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { StorageServiceFactory } from '~/service/storage/storage-factory';

const MpUploadSignAction = <Action>{
    router: {
        path: '/upload/sign',
        method: 'get',
        authRequired: true
    },

    response: async ctx => {
        const service = StorageServiceFactory.getStorageService();
        const storageConfig = service.getUploadConfig();

        ctx.body = {
            code: SUCCESS,
            data: {
                ...storageConfig
            }
        };
    }
};

export default MpUploadSignAction;
