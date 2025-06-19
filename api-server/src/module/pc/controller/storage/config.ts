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

const PcStorageConfigAction = <Action>{
    router: {
        path: '/storage/config',
        method: 'get',
        authRequired: config.inited
    },

    response: async ctx => {
        // 获取查询参数中的文件信息
        let filenameStr: string | undefined;
        let mimetypeStr: string | undefined;
        let dirStr: string | undefined;

        // 检查是否是新的params格式（前端发送的是一个params参数包含JSON）
        if (ctx.query.params) {
            try {
                const paramsStr = Array.isArray(ctx.query.params) ? ctx.query.params[0] : ctx.query.params;
                const parsedParams = JSON.parse(decodeURIComponent(paramsStr));
                filenameStr = parsedParams.filename;
                mimetypeStr = parsedParams.mimetype;
                dirStr = parsedParams.dir;
            } catch (error) {
                console.warn('Failed to parse params:', error);
                // 如果解析失败，使用undefined值
            }
        } else {
            // 兼容直接传递的参数格式
            const { filename, mimetype, dir } = ctx.query;
            filenameStr = Array.isArray(filename) ? filename[0] : filename;
            mimetypeStr = Array.isArray(mimetype) ? mimetype[0] : mimetype;
            dirStr = Array.isArray(dir) ? dir[0] : dir;
        }

        // 添加调试日志
        console.log('Storage config request params:', {
            filename: filenameStr,
            mimetype: mimetypeStr,
            dir: dirStr
        });

        try {
            const storageService = StorageServiceFactory.getStorageService();
            const uploadConfig = await storageService.getUploadConfig(filenameStr, mimetypeStr, dirStr);
            const currentMode = StorageServiceFactory.getCurrentMode();

            // 构建统一的配置响应
            const response: any = {
                mode: currentMode,
                baseUrl: StorageServiceFactory.getBaseUrl(),
                expire: uploadConfig.expire || Date.now() + 30 * 60 * 1000,
                uploadStrategy: getUploadStrategy(currentMode)
            };

            // 根据不同存储模式添加特定配置
            switch (currentMode) {
                case 'local':
                    response.uploadUrl = '/pc/storage/upload';
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
                    }
                    break;

                case 'minio':
                    if (uploadConfig.presignedUrl) {
                        response.presignedUrl = uploadConfig.presignedUrl;
                        response.bucket = uploadConfig.bucket;
                        response.key = uploadConfig.key;
                    } else {
                        // 如果没有预签名URL，使用服务端上传
                        response.uploadStrategy = 'server';
                        response.uploadUrl = '/pc/storage/upload';
                    }
                    break;
            }

            ctx.body = {
                code: SUCCESS,
                data: response
            };
        } catch (error) {
            console.error('Get storage config error:', error);
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
