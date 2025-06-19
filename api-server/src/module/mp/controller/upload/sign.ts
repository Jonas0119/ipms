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
