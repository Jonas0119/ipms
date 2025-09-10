/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import { StorageServiceFactory } from '~/service/storage/storage-factory';

const MpStorageConfigAction = <Action>{
    router: {
        path: '/storage/config',
        method: 'get',
        authRequired: true
    },

    response: async ctx => {
        const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const startTime = Date.now();
        
        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] ==================== 存储配置请求开始 ====================`);
        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 请求URL:`, ctx.request.url);
        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 请求IP:`, ctx.request.ip);
        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] User-Agent:`, ctx.request.header['user-agent']);
        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 认证令牌:`, ctx.request.header['ipms-mp-token'] ? '已提供' : '未提供');
        
        try {
            // 解析查询参数（兼容 filename/mimetype/dir 或 params=json）
            let filenameStr: string | undefined;
            let mimetypeStr: string | undefined;
            let dirStr: string | undefined;

            console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 原始查询参数:`, ctx.query);

            if (ctx.query.params) {
                console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 使用JSON参数格式`);
                try {
                    const paramsStr = Array.isArray(ctx.query.params) ? ctx.query.params[0] : ctx.query.params;
                    console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 原始params:`, paramsStr);
                    
                    const decodedParams = decodeURIComponent(paramsStr as string);
                    console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 解码params:`, decodedParams);
                    
                    const parsed = JSON.parse(decodedParams);
                    console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 解析后params:`, parsed);
                    
                    filenameStr = parsed.filename;
                    mimetypeStr = parsed.mimetype;
                    dirStr = parsed.dir;
                } catch (e) {
                    console.warn(`⚠️ [MP-STORAGE-CONFIG-${requestId}] JSON参数解析失败:`, e);
                }
            } else {
                console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 使用直接参数格式`);
                const { filename, mimetype, dir } = ctx.query as Record<string, string | string[]>;
                filenameStr = Array.isArray(filename) ? filename[0] : (filename as string | undefined);
                mimetypeStr = Array.isArray(mimetype) ? mimetype[0] : (mimetype as string | undefined);
                dirStr = Array.isArray(dir) ? dir[0] : (dir as string | undefined);
            }

            console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 解析后的参数:`, {
                filename: filenameStr,
                mimetype: mimetypeStr,
                dir: dirStr
            });

            const mode = StorageServiceFactory.getCurrentMode();
            const baseUrl = StorageServiceFactory.getBaseUrl();
            console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 当前存储模式:`, mode);
            console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 基础URL:`, baseUrl);

            const service = StorageServiceFactory.getStorageService();
            console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 获取存储服务实例完成`);

            // 检测是否为小程序请求
            const isMiniProgram = ctx.request.header['wechat-mp-request'] === 'true';
            console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 小程序请求检测:`, isMiniProgram);

            const uploadConfig = await service.getUploadConfig(filenameStr, mimetypeStr, dirStr, isMiniProgram);
            console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 存储服务返回配置:`, uploadConfig);

            const resp: any = {
                mode,
                baseUrl,
                expire: uploadConfig.expire || Date.now() + 30 * 60 * 1000,
                uploadStrategy: getUploadStrategy(mode)
            };

            console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 基础响应配置:`, resp);

            switch (mode) {
                case 'local':
                    resp.uploadUrl = '/mp/storage/upload';
                    console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] Local模式 - 上传URL:`, resp.uploadUrl);
                    break;
                case 'oss':
                    if (uploadConfig.policy && uploadConfig.signature) {
                        resp.formData = {
                            policy: uploadConfig.policy,
                            signature: uploadConfig.signature,
                            OSSAccessKeyId: uploadConfig.accessid,
                            host: uploadConfig.host,
                            dir: uploadConfig.dir || '',
                            success_action_status: '200'
                        };
                        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] OSS模式 - 直传配置已生成`);
                        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] OSS主机:`, uploadConfig.host);
                        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] OSS目录:`, uploadConfig.dir);
                    } else {
                        console.warn(`⚠️ [MP-STORAGE-CONFIG-${requestId}] OSS配置不完整，缺少policy或signature`);
                    }
                    break;
                case 'minio':
                    console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] MinIO模式 - 检查直传支持`);
                    console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] MinIO上传策略:`, uploadConfig.uploadStrategy);
                    console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] MinIO postURL:`, uploadConfig.postURL ? '已提供' : '未提供');
                    console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] MinIO formData:`, uploadConfig.formData ? '已提供' : '未提供');
                    
                    // MinIO 使用 presignedPostPolicy 支持 POST 方法直传
                    // 这样既兼容小程序又保持直传性能
                    if (uploadConfig.uploadStrategy === 'direct' && uploadConfig.postURL && uploadConfig.formData) {
                        // 使用 MinIO POST Policy 直传
                        resp.uploadStrategy = 'direct';
                        resp.postURL = uploadConfig.postURL;
                        resp.formData = uploadConfig.formData;
                        resp.bucket = uploadConfig.bucket;
                        resp.key = uploadConfig.key;
                        console.log(`✅ [MP-STORAGE-CONFIG-${requestId}] MinIO直传配置已生成`);
                        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] MinIO POST URL:`, uploadConfig.postURL);
                        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] MinIO存储桶:`, uploadConfig.bucket);
                        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] MinIO对象键:`, uploadConfig.key);
                    } else {
                        // 回退到服务器上传
                        resp.uploadStrategy = 'server';
                        resp.uploadUrl = '/mp/storage/upload';
                        console.log(`⚠️ [MP-STORAGE-CONFIG-${requestId}] MinIO回退到服务器上传`);
                        console.log(`🔧 [MP-STORAGE-CONFIG-${requestId}] 服务器上传URL:`, resp.uploadUrl);
                    }
                    break;
            }

            const processTime = Date.now() - startTime;
            console.log(`✅ [MP-STORAGE-CONFIG-${requestId}] ==================== 配置生成成功 ====================`);
            console.log(`✅ [MP-STORAGE-CONFIG-${requestId}] 处理耗时:`, processTime, 'ms');
            console.log(`✅ [MP-STORAGE-CONFIG-${requestId}] 最终响应:`, resp);

            ctx.body = {
                code: SUCCESS,
                data: resp
            };
        } catch (error) {
            const processTime = Date.now() - startTime;
            console.error(`❌ [MP-STORAGE-CONFIG-${requestId}] ==================== 配置生成失败 ====================`);
            console.error(`❌ [MP-STORAGE-CONFIG-${requestId}] 错误信息:`, error);
            console.error(`❌ [MP-STORAGE-CONFIG-${requestId}] 错误堆栈:`, error.stack);
            console.error(`❌ [MP-STORAGE-CONFIG-${requestId}] 失败耗时:`, processTime, 'ms');
            
            ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: error.message || '获取存储配置失败'
            };
        }
    }
};

function getUploadStrategy(mode: string): string {
    switch (mode) {
        case 'local':
            return 'server';
        case 'oss':
            return 'direct';
        case 'minio':
            // MinIO 现在支持 POST 直传，优先使用直传
            // 如果失败会自动回退到服务器上传
            return 'direct';
        default:
            return 'server';
    }
}

export default MpStorageConfigAction;


