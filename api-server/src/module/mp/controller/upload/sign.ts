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
        // 检测是否为小程序请求
        const isMiniProgram = ctx.request.header['wechat-mp-request'] === 'true';
        const requestType = isMiniProgram ? 'MiniProgram' : 'PC';
        
        console.log(`[${requestType}] MiniProgram upload sign request started`);
        console.log(`[${requestType}] Request headers:`, {
            'wechat-mp-request': ctx.request.header['wechat-mp-request'] || 'not provided',
            'user-agent': ctx.request.header['user-agent'] || 'not provided'
        });
        
        try {
            const service = StorageServiceFactory.getStorageService();
            console.log(`[${requestType}] Storage service obtained, getting upload config...`);
            
            const storageConfig = await service.getUploadConfig(undefined, undefined, undefined, isMiniProgram);
            
            console.log(`[${requestType}] Upload config generated:`, {
                mode: storageConfig.mode,
                uploadStrategy: storageConfig.uploadStrategy,
                hasPostURL: !!storageConfig.postURL,
                hasFormData: !!storageConfig.formData,
                hasPresignedUrl: !!storageConfig.presignedUrl,
                bucket: storageConfig.bucket,
                key: storageConfig.key
            });
            
            if (storageConfig.mode === 'minio') {
                if (isMiniProgram) {
                    console.log(`[${requestType}] MinIO POST upload config for MiniProgram:`, {
                        postURL: storageConfig.postURL,
                        formDataKeys: storageConfig.formData ? Object.keys(storageConfig.formData) : [],
                        bucket: storageConfig.bucket,
                        key: storageConfig.key
                    });
                } else {
                    console.log(`[${requestType}] MinIO PUT upload config for PC:`, {
                        presignedUrl: storageConfig.presignedUrl ? storageConfig.presignedUrl.substring(0, 100) + '...' : 'none',
                        bucket: storageConfig.bucket,
                        key: storageConfig.key
                    });
                }
            }

            ctx.body = {
                code: SUCCESS,
                data: {
                    ...storageConfig
                }
            };
            
            console.log(`[${requestType}] Upload sign response sent successfully`);
        } catch (error) {
            console.error(`[${requestType}] Upload sign error:`, error);
            ctx.body = {
                code: 500,
                message: error.message || '获取上传配置失败'
            };
        }
    }
};

export default MpUploadSignAction;
