/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
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
        const isMiniProgram = ctx.request.header['wechat-mp-request'] === 'true';
        const requestType = isMiniProgram ? 'MiniProgram' : 'PC';
        
        console.log(`[${requestType}] Storage upload request started`);
        console.log(`[${requestType}] Upload headers:`, {
            'ipms-pc-token': ctx.request.header['ipms-pc-token'] ? 'provided' : 'missing',
            'wechat-mp-request': ctx.request.header['wechat-mp-request'] || 'not provided',
            'content-type': ctx.request.header['content-type'] || 'not provided'
        });
        
        try {
            console.log(`[${requestType}] Getting storage service instance...`);
            const storageService = StorageServiceFactory.getStorageService();
            console.log(`[${requestType}] Storage service instance obtained`);

            // 检查是否支持服务端上传
            if (!storageService.handleFileUpload) {
                console.warn(`[${requestType}] Current storage mode does not support server upload`);
                ctx.body = {
                    code: DATA_MODEL_UPDATE_FAIL,
                    message: isMiniProgram 
                        ? '当前存储模式不支持服务端上传，请使用直传方式'
                        : '当前存储模式不支持服务端上传'
                };
                return;
            }

            console.log(`[${requestType}] Starting file upload via storage service`);
            console.log(`[${requestType}] Upload request details:`, {
                hasFile: !!ctx.request.files,
                fileCount: ctx.request.files ? Object.keys(ctx.request.files).length : 0,
                contentType: ctx.request.header['content-type'],
                contentLength: ctx.request.header['content-length']
            });
            
            const result = await storageService.handleFileUpload(ctx);
            console.log(`[${requestType}] File upload successful:`, {
                url: result.url,
                key: result.key,
                fileSize: result.size || 'unknown'
            });

            ctx.body = {
                code: SUCCESS,
                data: {
                    success: true,
                    url: result.url,
                    key: result.key
                }
            };
        } catch (error) {
            console.error(`[${requestType}] Storage upload error:`, error);
            console.error(`[${requestType}] Error stack:`, error.stack);
            
            const errorMessage = isMiniProgram 
                ? `文件上传失败: ${error.message || '请检查网络连接后重试'}`
                : error.message || '文件上传失败';
                
            ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: errorMessage,
                ...(isMiniProgram && { 
                    debug: {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                })
            };
        }
    }
};

export default PcStorageUploadAction;
