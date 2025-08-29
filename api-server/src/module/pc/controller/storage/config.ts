/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import { StorageServiceFactory } from '~/service/storage/storage-factory';
import config from '~/config';

/**
 * PC端存储配置接口
 * 
 * 接口作用：
 * 1. 为前端文件上传组件提供上传配置信息
 * 2. 支持多种存储模式（本地存储/阿里云OSS/MinIO）的统一配置获取
 * 3. 根据不同存储模式返回相应的上传策略和必要参数
 * 
 * 调用时机：
 * - 前端准备上传文件时，首先调用此接口获取上传配置
 * - 支持传入文件名、MIME类型、目录等参数以获取个性化配置
 * - 通常在文件选择后、实际上传前调用
 * 
 * 路由: GET /pc/storage/config
 * 权限: 需要系统已初始化（config.inited为true）
 */
const PcStorageConfigAction = <Action>{
    router: {
        path: '/storage/config',
        method: 'get',
        authRequired: config.inited  // 仅在系统初始化后才需要认证
    },

    response: async ctx => {
        // 记录接口调用日志，便于调试和监控
        kjhlog.info('=== STORAGE CONFIG API CALLED ===');
        kjhlog.info(`Request URL: ${ctx.request.url}`);
        kjhlog.info(`Query string: ${JSON.stringify(ctx.query)}`);
        
        // 解析查询参数中的文件信息
        let filenameStr: string | undefined;  // 文件名
        let mimetypeStr: string | undefined;  // MIME类型
        let dirStr: string | undefined;       // 目标目录

        // 处理两种参数传递格式：
        // 1. 新格式：前端将参数打包成JSON字符串传递（params参数）
        // 2. 旧格式：直接传递filename、mimetype、dir参数
        if (ctx.query.params) {
            try {
                // 获取params参数（可能是数组格式）
                const paramsStr = Array.isArray(ctx.query.params) ? ctx.query.params[0] : ctx.query.params;
                kjhlog.info(`Raw params string: ${paramsStr}`);
                
                // URL解码并解析JSON
                const decodedParams = decodeURIComponent(paramsStr);
                kjhlog.info(`Decoded params: ${decodedParams}`);
                
                const parsedParams = JSON.parse(decodedParams);
                kjhlog.info(`Parsed params object:`, parsedParams);
                
                // 提取文件信息
                filenameStr = parsedParams.filename;
                mimetypeStr = parsedParams.mimetype;
                dirStr = parsedParams.dir;
            } catch (error) {
                kjhlog.warn('Failed to parse params:', error);
                // 解析失败时使用undefined值，让后续逻辑使用默认配置
            }
        } else {
            // 兼容旧版本的直接参数传递方式
            const { filename, mimetype, dir } = ctx.query;
            filenameStr = Array.isArray(filename) ? filename[0] : filename;
            mimetypeStr = Array.isArray(mimetype) ? mimetype[0] : mimetype;
            dirStr = Array.isArray(dir) ? dir[0] : dir;
        }

        // 从存储服务工厂获取当前配置信息
        const currentMode = StorageServiceFactory.getCurrentMode();  // 当前存储模式
        const baseUrl = StorageServiceFactory.getBaseUrl();          // 基础访问URL
        
        // 详细记录存储配置信息，便于问题排查
        kjhlog.info('=== Storage Config Request ===');
        kjhlog.info(`Storage Mode: ${currentMode}`);
        kjhlog.info(`Base URL: ${baseUrl}`);
        kjhlog.info('Request params:', {
            filename: filenameStr || 'undefined',
            mimetype: mimetypeStr || 'undefined',
            dir: dirStr || 'undefined'
        });
        // 记录配置详情（敏感信息已隐藏）
        kjhlog.info(`Storage detailed config:`, {
            mode: currentMode,
            localConfig: config.storage.local,
            ossConfig: config.storage.oss ? { ...config.storage.oss, accessKeySecret: '[HIDDEN]' } : undefined,
            minioConfig: config.storage.minio ? { ...config.storage.minio, secretKey: '[HIDDEN]' } : undefined
        });

        try {
            // 获取存储服务实例并生成上传配置
            const storageService = StorageServiceFactory.getStorageService();
            const uploadConfig = await storageService.getUploadConfig(filenameStr, mimetypeStr, dirStr);

            // 构建统一的配置响应格式
            const response: any = {
                mode: currentMode,                                      // 存储模式
                baseUrl: baseUrl,                                      // 文件访问基础URL
                expire: uploadConfig.expire || Date.now() + 30 * 60 * 1000,  // 配置过期时间（默认30分钟）
                uploadStrategy: getUploadStrategy(currentMode)          // 上传策略
            };

            // 根据不同存储模式添加特定的上传配置
            switch (currentMode) {
                case 'local':
                    // 本地存储：文件上传到服务器
                    response.uploadUrl = '/pc/storage/upload';
                    kjhlog.info(`Local storage configured with upload URL: ${response.uploadUrl}`);
                    break;

                case 'oss':
                    // 阿里云OSS：直传到OSS，需要提供签名等信息
                    if (uploadConfig.policy && uploadConfig.signature) {
                        response.formData = {
                            policy: uploadConfig.policy,                    // 上传策略
                            signature: uploadConfig.signature,              // 签名
                            OSSAccessKeyId: uploadConfig.accessid,         // AccessKeyId
                            host: uploadConfig.host,                        // OSS域名
                            dir: uploadConfig.dir || '',                    // 上传目录
                            success_action_status: '200'                    // 成功状态码
                        };
                        kjhlog.info(`OSS storage configured with direct upload to: ${uploadConfig.host}`);
                    }
                    break;

                case 'minio':
                    // MinIO存储：优先使用预签名URL直传
                    if (uploadConfig.presignedUrl) {
                        response.presignedUrl = uploadConfig.presignedUrl;  // 预签名上传URL
                        response.bucket = uploadConfig.bucket;              // 存储桶名称
                        response.key = uploadConfig.key;                    // 对象键名
                        kjhlog.info(`MinIO storage configured with presigned URL for bucket: ${uploadConfig.bucket}`);
                    } else {
                        // 预签名URL生成失败时，回退到服务端上传
                        response.uploadStrategy = 'server';
                        response.uploadUrl = '/pc/storage/upload';
                        kjhlog.info(`MinIO storage fallback to server upload`);
                    }
                    break;
            }

            kjhlog.success(`Storage config response prepared for mode: ${currentMode}`);

            // 返回成功响应
            ctx.body = {
                code: SUCCESS,
                data: response
            };
        } catch (error) {
            // 处理配置获取失败的情况
            kjhlog.error('Get storage config error:', error);
            ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: error.message || '获取存储配置失败'
            };
        }
    }
};

/**
 * 根据存储模式获取对应的上传策略
 * 
 * @param mode 存储模式 ('local' | 'oss' | 'minio')
 * @returns 上传策略字符串
 * 
 * 上传策略说明：
 * - server: 文件上传到服务器，由服务器处理存储
 * - direct: 前端直接上传到云存储（如OSS）
 * - presigned: 使用预签名URL上传（如MinIO）
 */
function getUploadStrategy(mode: string): string {
    switch (mode) {
        case 'local':
            return 'server';      // 本地存储使用服务器上传
        case 'oss':
            return 'direct';      // OSS使用直传
        case 'minio':
            return 'presigned';   // MinIO使用预签名URL
        default:
            return 'server';      // 默认使用服务器上传
    }
}

/**
 * ES6模块默认导出语句
 * 
 * 这句话的含义：
 * - 将 PcStorageConfigAction 作为当前模块的默认导出
 * - 其他模块可以通过 import 语句导入这个默认导出
 * 
 * 在TypeScript中的理解：
 * - export default 是ES6模块系统的语法，用于导出一个模块的默认值
 * - 相当于告诉其他文件："这个模块最重要的东西是 PcStorageConfigAction"
 * - 导入时可以使用：import PcStorageConfigAction from './config' 或任意命名
 * - 与具名导出(export { name })不同，默认导出在导入时不需要使用花括号
 * 
 * 作用：
 * - 提供模块间的代码复用和组织
 * - 使其他文件能够导入并使用这个Action配置对象
 * - 在路由系统中注册这个API接口处理器
 */
export default PcStorageConfigAction;
