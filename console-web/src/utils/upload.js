/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Message } from 'view-design';
import router from '@/router';
import * as config from '@/config';
import auth from './auth';
import request from './request';

/* * 统一上传服务类 - 整合原 oss.js 和 upload.js 功能
 * 前端零配置，所有存储信息从后端获取
 */
class UnifiedUploadService {
    constructor() {
        this.storageConfig = null;
        this.configExpire = 0;
    }

    /*     * 获取存储配置（替代原 oss.js 功能）
     */
    async getStorageConfig(file, options = {}) {
        const now = Date.now();

        // 对于MinIO预签名上传，需要传递文件信息以生成正确的扩展名
        let needFileInfo = false;
        let params = {};

        if (file) {
            params.filename = file.name;
            params.mimetype = file.type;
            needFileInfo = true;
        }

        if (options.dir) {
            params.dir = options.dir;
            needFileInfo = true; // 有dir参数时也不使用缓存
        }

        // 配置缓存机制 - 如果需要文件信息，则不使用缓存
        if (!needFileInfo && this.storageConfig && this.configExpire >= now + 10000) {
            return this.storageConfig;
        }

        try {
            const response = await request.get('/storage/config', { params });

            // 只有在不需要文件信息时才缓存配置
            if (!needFileInfo) {
                this.storageConfig = response.data;
                this.configExpire = this.storageConfig.expire || now + 30 * 60 * 1000;
            }

            return response.data;
        } catch (error) {
            // 注释掉console.error以符合lint规则
            // console.error('获取存储配置失败:', error);
            throw new Error('无法获取存储配置，请检查网络连接');
        }
    }

    /*     * 清除配置缓存（用于配置更新后强制重新获取）
     */
    clearCache() {
        this.storageConfig = null;
        this.configExpire = 0;
    }

    /*     * 统一上传接口
     * @param {File} file - 要上传的文件
     * @param {Object} options - 上传选项
     * @param {Function} options.onProgress - 进度回调
     * @param {String} options.dir - 上传目录
     */
    async upload(file, options = {}) {
        let config = await this.getStorageConfig(file, options);

        // 对于MinIO预签名上传，每次都需要获取新的配置（因为每次key都不同）
        if (config.uploadStrategy === 'presigned' && config.mode === 'minio') {
            // 清除缓存并重新获取配置，确保每次上传都有唯一的key和presignedUrl
            this.clearCache();
            config = await this.getStorageConfig(file, options);
        }

        switch (config.uploadStrategy) {
            case 'server':
                return this.serverUpload(file, config, options);
            case 'direct':
                return this.directUpload(file, config, options);
            case 'presigned':
                return this.presignedUpload(file, config, options);
            default:
                throw new Error(`不支持的上传策略: ${config.uploadStrategy}`);
        }
    }

    /*     * 服务端上传（本地存储模式）
     */
    async serverUpload(file, config, options) {
        const formData = new FormData();
        formData.append('file', file);

        if (options.dir) {
            formData.append('dir', options.dir);
        }

        return this.executeUpload({
            url: config.uploadUrl,
            data: formData,
            onProgress: options.onProgress
        });
    }

    /*     * 直传上传（OSS模式）
     */
    async directUpload(file, config, options) {
        const formData = new FormData();

        // 添加OSS必需的表单字段
        Object.keys(config.formData || {}).forEach(key => {
            formData.append(key, config.formData[key]);
        });

        // 生成文件key
        const fileKey = this.generateFileKey(file, options.dir);
        formData.append('key', fileKey);
        formData.append('file', file);

        await this.executeUpload({
            url: config.formData.host,
            data: formData,
            onProgress: options.onProgress
        });

        // OSS上传成功后返回标准格式
        return {
            code: 200,
            data: {
                url: `${config.baseUrl}/${fileKey}`,
                key: fileKey
            }
        };
    }

    /*     * 预签名上传（MinIO模式）
     */
    async presignedUpload(file, config, options) {
        // 使用PUT方法进行预签名上传
        console.log('presignedUrl', config.presignedUrl);
        await this.executeUploadToPutUrl({
            url: config.presignedUrl,
            data: file,
            onProgress: options.onProgress
        });

        // MinIO预签名上传成功后返回标准格式
        return {
            code: 200,
            data: {
                url: `${config.baseUrl}/${config.bucket}/${config.key}`,
                key: config.key
            }
        };
    }

    /*     * 执行PUT上传（用于MinIO预签名上传）
     */
    async executeUploadToPutUrl({ url, data, onProgress }) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open('PUT', url, true);

            xhr.upload.addEventListener(
                'progress',
                e => {
                    if (e.lengthComputable && typeof onProgress === 'function') {
                        const progress = Math.floor((e.loaded / e.total) * 100);
                        onProgress(progress);
                    }
                },
                false
            );

            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
                        resolve({ code: 200 });
                    } else {
                        const errorMsg = '文件上传失败';
                        Message.error(errorMsg);
                        reject(new Error(errorMsg));
                    }
                }
            };

            xhr.send(data);
        });
    }

    /*     * 执行上传（保留原 upload.js 的核心逻辑）
     */
    async executeUpload({ url, data, onProgress }) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const token = auth.getToken();

            xhr.open('post', url, true);

            if (token && url.startsWith('/')) {
                xhr.setRequestHeader(config.AUTH_HEADER_NAME, token);
            }

            xhr.upload.addEventListener(
                'progress',
                e => {
                    if (e.lengthComputable && typeof onProgress === 'function') {
                        const progress = Math.floor((e.loaded / e.total) * 100);
                        onProgress(progress);
                    }
                },
                false
            );

            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
                        let response = {};
                        try {
                            response = JSON.parse(xhr.responseText || '{}');
                        } catch (e) {
                            // OSS等服务可能返回空响应
                            response = { code: 200 };
                        }
                        resolve(response);
                    } else if (xhr.status === 401) {
                        if (router.currentRoute.path !== '/login') {
                            router.replace({
                                path: '/login',
                                query: { redirect: router.currentRoute.fullPath }
                            });
                        }
                        reject(new Error('认证失败'));
                    } else {
                        let errorMsg = '上传失败';
                        try {
                            const errorResponse = JSON.parse(xhr.responseText);
                            errorMsg = errorResponse.message || errorMsg;
                        } catch (e) {
                            // 忽略解析错误
                        }
                        Message.error(errorMsg);
                        reject(new Error(errorMsg));
                    }
                }
            };

            xhr.send(data);
        });
    }

    /*     * 生成文件key
     */
    generateFileKey(file, dir = '') {
        const timestamp = Date.now();
        const random = Math.random()
            .toString(36)
            .substring(2, 15);
        const ext = this.getFileExtension(file);
        const filename = `${timestamp}_${random}${ext}`;

        return dir ? `${dir}/${filename}` : filename;
    }

    /*     * 获取文件扩展名
     */
    getFileExtension(file) {
        const name = file.name || '';
        let ext = name.substring(name.lastIndexOf('.'));

        if (!ext && file.type) {
            const mimeType = file.type;
            if (mimeType.includes('png')) ext = '.png';
            else if (mimeType.includes('gif')) ext = '.gif';
            else if (mimeType.includes('webp')) ext = '.webp';
            else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
            else ext = '.jpg'; // 默认
        }

        return ext || '.jpg';
    }
}

// 创建单例
const uploadService = new UnifiedUploadService();

// 默认导出统一上传服务
export default uploadService;
