/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import { StorageServiceFactory } from '~/service/storage/storage-factory';
import config from '~/config';

const MpStorageUploadAction = <Action>{
    router: {
        path: '/storage/upload',
        method: 'post',
        authRequired: true // 小程序上传需要认证
    },

    response: async ctx => {
        const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const startTime = Date.now();
        
        console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] ==================== 文件上传请求开始 ====================`);
        console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] 请求URL:`, ctx.request.url);
        console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] 请求IP:`, ctx.request.ip);
        console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] User-Agent:`, ctx.request.header['user-agent']);
        console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] 认证令牌:`, ctx.request.header['ipms-mp-token'] ? '已提供' : '未提供');
        console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] Content-Type:`, ctx.request.header['content-type']);
        
        try {
            console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] 当前存储模式:`, config.storage.mode);
            console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] 请求文件:`, ctx.request.files);
            console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] 请求参数:`, ctx.request.body);
            
            // 文件基本信息验证
            if (!ctx.request.files || Object.keys(ctx.request.files).length === 0) {
                console.error(`❌ [MP-STORAGE-UPLOAD-${requestId}] 未检测到上传文件`);
                ctx.body = {
                    code: DATA_MODEL_UPDATE_FAIL,
                    message: '未检测到上传文件'
                };
                return;
            }

            // 记录上传文件的详细信息
            const fileKeys = Object.keys(ctx.request.files);
            console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] 检测到 ${fileKeys.length} 个文件字段:`, fileKeys);
            
            for (const key of fileKeys) {
                const file = ctx.request.files[key];
                const fileArray = Array.isArray(file) ? file : [file];
                console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] 字段 "${key}" 包含 ${fileArray.length} 个文件:`);
                
                fileArray.forEach((f, index) => {
                    console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}]   文件[${index}]:`, {
                        name: f.name,
                        size: f.size,
                        type: f.type,
                        lastModifiedDate: f.lastModifiedDate,
                        filepath: (f as any).filepath || (f as any).path
                    });
                });
            }
            
            const storageService = StorageServiceFactory.getStorageService();
            console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] 获取存储服务实例完成`);

            // 检查是否支持服务端上传
            if (!storageService.handleFileUpload) {
                console.error(`❌ [MP-STORAGE-UPLOAD-${requestId}] 当前存储模式不支持服务端上传`);
                ctx.body = {
                    code: DATA_MODEL_UPDATE_FAIL,
                    message: '当前存储模式不支持服务端上传'
                };
                return;
            }

            console.log(`📤 [MP-STORAGE-UPLOAD-${requestId}] 开始执行文件上传处理`);
            
            // 执行文件上传（MinIO/Local/OSS都通过这个接口处理）
            const result = await storageService.handleFileUpload(ctx);
            
            const uploadTime = Date.now() - startTime;
            console.log(`✅ [MP-STORAGE-UPLOAD-${requestId}] ==================== 文件上传成功 ====================`);
            console.log(`✅ [MP-STORAGE-UPLOAD-${requestId}] 上传结果:`, result);
            console.log(`✅ [MP-STORAGE-UPLOAD-${requestId}] 处理耗时:`, uploadTime, 'ms');
            console.log(`✅ [MP-STORAGE-UPLOAD-${requestId}] 文件URL:`, result.url);
            console.log(`✅ [MP-STORAGE-UPLOAD-${requestId}] 文件键:`, result.key);

            // 返回标准格式的响应
            const response = {
                code: SUCCESS,
                data: {
                    success: true,
                    url: result.url,      // 完整的访问URL
                    key: result.key       // 存储键（相对路径）
                }
            };
            
            console.log(`✅ [MP-STORAGE-UPLOAD-${requestId}] 最终响应:`, response);
            ctx.body = response;
            
        } catch (error) {
            const uploadTime = Date.now() - startTime;
            console.error(`❌ [MP-STORAGE-UPLOAD-${requestId}] ==================== 文件上传失败 ====================`);
            console.error(`❌ [MP-STORAGE-UPLOAD-${requestId}] 错误信息:`, error.message);
            console.error(`❌ [MP-STORAGE-UPLOAD-${requestId}] 错误堆栈:`, error.stack);
            console.error(`❌ [MP-STORAGE-UPLOAD-${requestId}] 失败耗时:`, uploadTime, 'ms');
            
            // 记录错误的详细上下文
            console.error(`❌ [MP-STORAGE-UPLOAD-${requestId}] 错误上下文:`, {
                storageMode: config.storage.mode,
                filesCount: ctx.request.files ? Object.keys(ctx.request.files).length : 0,
                bodySize: JSON.stringify(ctx.request.body || {}).length
            });
            
            ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: error.message || '文件上传失败'
            };
        }
    }
};

export default MpStorageUploadAction;
