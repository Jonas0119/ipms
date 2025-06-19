/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import { StorageServiceFactory } from '~/service/storage/storage-factory';
import config from '~/config';

const PcStorageConfigAction = <Action>{
    router: {
        path: '/storage/config',
        method: 'get',
        authRequired: config.inited
    },

    response: async ctx => {
        kjhlog.info('=== STORAGE CONFIG API CALLED ===');
        kjhlog.info(`Request URL: ${ctx.request.url}`);
        kjhlog.info(`Query string: ${JSON.stringify(ctx.query)}`);
        
        // 获取查询参数中的文件信息
        let filenameStr: string | undefined;
        let mimetypeStr: string | undefined;
        let dirStr: string | undefined;

        // 检查是否是新的params格式（前端发送的是一个params参数包含JSON）
        if (ctx.query.params) {
            try {
                const paramsStr = Array.isArray(ctx.query.params) ? ctx.query.params[0] : ctx.query.params;
                kjhlog.info(`Raw params string: ${paramsStr}`);
                
                // 尝试解码URL编码的字符串
                const decodedParams = decodeURIComponent(paramsStr);
                kjhlog.info(`Decoded params: ${decodedParams}`);
                
                const parsedParams = JSON.parse(decodedParams);
                kjhlog.info(`Parsed params object:`, parsedParams);
                
                filenameStr = parsedParams.filename;
                mimetypeStr = parsedParams.mimetype;
                dirStr = parsedParams.dir;
            } catch (error) {
                kjhlog.warn('Failed to parse params:', error);
                // 如果解析失败，使用undefined值
            }
        } else {
            // 兼容直接传递的参数格式
            const { filename, mimetype, dir } = ctx.query;
            filenameStr = Array.isArray(filename) ? filename[0] : filename;
            mimetypeStr = Array.isArray(mimetype) ? mimetype[0] : mimetype;
            dirStr = Array.isArray(dir) ? dir[0] : dir;
        }

        // 获取当前存储配置信息
        const currentMode = StorageServiceFactory.getCurrentMode();
        const baseUrl = StorageServiceFactory.getBaseUrl();
        
        // 详细的调试日志 - 包含存储类型信息
        kjhlog.info('=== Storage Config Request ===');
        kjhlog.info(`Storage Mode: ${currentMode}`);
        kjhlog.info(`Base URL: ${baseUrl}`);
        kjhlog.info('Request params:', {
            filename: filenameStr || 'undefined',
            mimetype: mimetypeStr || 'undefined',
            dir: dirStr || 'undefined'
        });
        kjhlog.info(`Storage detailed config:`, {
            mode: currentMode,
            localConfig: config.storage.local,
            ossConfig: config.storage.oss ? { ...config.storage.oss, accessKeySecret: '[HIDDEN]' } : undefined,
            minioConfig: config.storage.minio ? { ...config.storage.minio, secretKey: '[HIDDEN]' } : undefined
        });

        try {
            const storageService = StorageServiceFactory.getStorageService();
            const uploadConfig = await storageService.getUploadConfig(filenameStr, mimetypeStr, dirStr);

            // 构建统一的配置响应
            const response: any = {
                mode: currentMode,
                baseUrl: baseUrl,
                expire: uploadConfig.expire || Date.now() + 30 * 60 * 1000,
                uploadStrategy: getUploadStrategy(currentMode)
            };

            // 根据不同存储模式添加特定配置
            switch (currentMode) {
                case 'local':
                    response.uploadUrl = '/pc/storage/upload';
                    kjhlog.info(`Local storage configured with upload URL: ${response.uploadUrl}`);
                    break;

                case 'oss':
                    if (uploadConfig.policy && uploadConfig.signature) {
                        response.formData = {
                            policy: uploadConfig.policy,
                            signature: uploadConfig.signature,
                            OSSAccessKeyId: uploadConfig.accessid,
                            host: uploadConfig.host,
                            dir: uploadConfig.dir || '',
                            success_action_status: '200'
                        };
                        kjhlog.info(`OSS storage configured with direct upload to: ${uploadConfig.host}`);
                    }
                    break;

                case 'minio':
                    if (uploadConfig.presignedUrl) {
                        response.presignedUrl = uploadConfig.presignedUrl;
                        response.bucket = uploadConfig.bucket;
                        response.key = uploadConfig.key;
                        kjhlog.info(`MinIO storage configured with presigned URL for bucket: ${uploadConfig.bucket}`);
                    } else {
                        // 如果没有预签名URL，使用服务端上传
                        response.uploadStrategy = 'server';
                        response.uploadUrl = '/pc/storage/upload';
                        kjhlog.info(`MinIO storage fallback to server upload`);
                    }
                    break;
            }

            kjhlog.success(`Storage config response prepared for mode: ${currentMode}`);

            ctx.body = {
                code: SUCCESS,
                data: response
            };
        } catch (error) {
            kjhlog.error('Get storage config error:', error);
            ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: error.message || '获取存储配置失败'
            };
        }
    }
};

/**
 * 根据存储模式获取上传策略
 */
function getUploadStrategy(mode: string): string {
    switch (mode) {
        case 'local':
            return 'server';
        case 'oss':
            return 'direct';
        case 'minio':
            return 'presigned';
        default:
            return 'server';
    }
}

export default PcStorageConfigAction;
