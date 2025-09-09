/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import request from './request';
import * as file from './file';
import ossLegacy from './oss'; // 保留原有OSS功能
import * as storage from './storage';

/**
 * 统一存储上传服务
 * 支持 minio POST、OSS、local 三种上传方式
 * 与现有 oss.js 并存，不影响现有功能
 */
class UnifiedStorageService {
    constructor() {
        this.config = null;
        this.configExpire = 0;
    }

    /**
     * 获取存储配置（带缓存）
     * @param {string} filename - 文件名
     * @param {string} mimetype - MIME类型
     * @param {string} dir - 目录
     * @returns {Promise<Object>} 存储配置
     */
    async getConfig(filename, mimetype = 'image/jpeg', dir = '') {
        const now = Date.now();
        
        console.log('[UnifiedStorage-DEBUG] 🚀 开始获取存储配置');
        console.log('[UnifiedStorage-DEBUG] 📋 请求参数:', { filename, mimetype, dir, now });
        console.log('[UnifiedStorage-DEBUG] 💾 缓存状态:', {
            hasCache: !!this.config,
            configExpire: this.configExpire,
            cacheValid: this.config && this.configExpire > now,
            timeUntilExpire: this.configExpire ? (this.configExpire - now) : 'N/A'
        });
        
        // 仅当缓存存在且非直传策略时复用缓存；直传策略需要每次刷新，避免多文件共用同一签名/Key
        if (this.config && this.configExpire > now && this.config.uploadStrategy !== 'direct') {
            console.log('[UnifiedStorage-DEBUG] ✅ 使用缓存配置');
            return this.config;
        }

        try {
            console.log('[UnifiedStorage-DEBUG] 🌐 发起网络请求获取配置...');
            console.log('[UnifiedStorage-DEBUG] 📤 请求URL: /storage/config');
            console.log('[UnifiedStorage-DEBUG] 📤 请求数据:', { filename, mimetype, dir });
            
            const res = await request({
                url: '/storage/config',  // 使用 /pc/storage/config
                method: 'get',
                data: { filename, mimetype, dir }
            });

            console.log('[UnifiedStorage-DEBUG] ✅ 存储配置获取成功!');
            console.log('[UnifiedStorage-DEBUG] 📥 响应代码:', res.code);
            console.log('[UnifiedStorage-DEBUG] 📥 完整响应:', JSON.stringify(res, null, 2));
            console.log('[UnifiedStorage-DEBUG] 🔧 配置详情:', {
                mode: res.data.mode,
                uploadStrategy: res.data.uploadStrategy,
                baseUrl: res.data.baseUrl,
                hasPostURL: !!res.data.postURL,
                hasFormData: !!res.data.formData,
                hasUploadUrl: !!res.data.uploadUrl
            });
            
            this.config = res.data;
            this.configExpire = res.data.expire || (now + 30 * 60 * 1000); // 默认30分钟过期
            
            console.log('[UnifiedStorage-DEBUG] 💾 配置已缓存，过期时间:', new Date(this.configExpire));
            
            return this.config;
        } catch (error) {
            console.error('[UnifiedStorage-DEBUG] ❌ 获取统一存储配置失败!');
            console.error('[UnifiedStorage-DEBUG] ❌ 错误详情:', error);
            console.error('[UnifiedStorage-DEBUG] ❌ 错误消息:', error.message);
            console.error('[UnifiedStorage-DEBUG] ❌ 错误堆栈:', error.stack);
            console.warn('[UnifiedStorage-DEBUG] 🔄 将回退到OSS上传方式');
            return null;
        }
    }

    /**
     * 统一上传方法
     * @param {string} filePath - 本地文件路径
     * @param {string} filename - 文件名
     * @param {string} mimetype - MIME类型
     * @param {string} dir - 目录
     * @returns {Promise<{url: string, key: string}>} 上传结果
     */
    async upload(filePath, filename, mimetype = 'image/jpeg', dir = '') {
        console.log('[UnifiedStorage-DEBUG] 🚀 开始文件上传流程');
        console.log('[UnifiedStorage-DEBUG] 📁 上传参数:', { filePath, filename, mimetype, dir });
        
        const config = await this.getConfig(filename, mimetype, dir);
        
        if (!config) {
            // 回退到原有OSS逻辑
            console.log('[UnifiedStorage-DEBUG] ⚠️ 未获取到配置，回退到原有OSS逻辑');
            return this.uploadWithLegacyOSS(filePath, filename, dir);
        }
        
        console.log('[UnifiedStorage-DEBUG] 🎯 上传策略确定:');
        console.log('[UnifiedStorage-DEBUG] 📦 存储模式:', config.mode);
        console.log('[UnifiedStorage-DEBUG] 🔄 上传策略:', config.uploadStrategy);
        
        // 根据上传策略决定使用哪种上传方式
        switch (config.uploadStrategy) {
            case 'direct':
                if (config.mode === 'minio') {
                    console.log('[UnifiedStorage-DEBUG] 🚀 使用 MinIO POST 直传');
                    return this.uploadWithMinIO(filePath, config);
                } else {
                    console.log('[UnifiedStorage-DEBUG] 🚀 使用新版 OSS 直传');
                    return this.uploadWithOSS(filePath, config);
                }
            case 'server':
                console.log('[UnifiedStorage-DEBUG] 🚀 使用服务器上传');
                return this.uploadWithServer(filePath, config, dir);
            default:
                console.log('[UnifiedStorage-DEBUG] ❓ 未知上传策略，回退到原有OSS');
                console.log('[UnifiedStorage-DEBUG] ❓ 策略值:', config.uploadStrategy);
                return this.uploadWithLegacyOSS(filePath, filename, dir);
        }
    }

    /**
     * MinIO POST 直传（兼容微信小程序）
     * @param {string} filePath - 文件路径
     * @param {Object} config - 存储配置
     * @returns {Promise<{url: string, key: string}>}
     */
    async uploadWithMinIO(filePath, config) {
        console.log('[UnifiedStorage-DEBUG] 🔧 开始 MinIO POST 直传');
        
        if (!config.postURL || !config.formData) {
            console.error('[UnifiedStorage-DEBUG] ❌ MinIO 配置不完整:', {
                hasPostURL: !!config.postURL,
                hasFormData: !!config.formData,
                postURL: config.postURL,
                formDataKeys: config.formData ? Object.keys(config.formData) : []
            });
            throw new Error('MinIO POST 配置获取失败');
        }

        console.log('[UnifiedStorage-DEBUG] 📋 MinIO POST 上传配置详情:');
        console.log('[UnifiedStorage-DEBUG] 🌐 POST URL:', config.postURL);
        console.log('[UnifiedStorage-DEBUG] 📦 Bucket:', config.bucket);
        console.log('[UnifiedStorage-DEBUG] 🔑 Key:', config.key);
        console.log('[UnifiedStorage-DEBUG] 📝 FormData Keys:', Object.keys(config.formData));
        console.log('[UnifiedStorage-DEBUG] 📝 Complete FormData:', config.formData);

        // 先检查文件是否可访问
        return new Promise((resolve, reject) => {
            console.log('[UnifiedStorage-DEBUG] 🔍 检查文件信息:', filePath);
            
            wx.getFileInfo({
                filePath: filePath,
                success: (fileInfo) => {
                    console.log('[UnifiedStorage-DEBUG] ✅ 文件信息检查成功:');
                    console.log('[UnifiedStorage-DEBUG] 📊 文件大小:', fileInfo.size, 'bytes');
                    console.log('[UnifiedStorage-DEBUG] 📊 文件摘要:', fileInfo.digest);
                    
                    console.log('[UnifiedStorage-DEBUG] 🚀 开始 MinIO 文件上传...');
                    
                    // 文件可访问，开始上传
                    wx.uploadFile({
                        url: config.postURL,
                        filePath,
                        name: 'file',
                        formData: config.formData,
                        success: (res) => {
                            console.log('[UnifiedStorage-DEBUG] 📥 MinIO 上传响应:');
                            console.log('[UnifiedStorage-DEBUG] 📊 状态码:', res.statusCode);
                            console.log('[UnifiedStorage-DEBUG] 📊 响应头:', res.header);
                            console.log('[UnifiedStorage-DEBUG] 📊 响应数据:', res.data);
                            
                            // MinIO POST 上传成功通常返回 204 No Content
                            if (res.statusCode >= 200 && res.statusCode < 300) {
                                const result = {
                                    url: `${config.baseUrl}/${config.bucket}/${config.key}`,
                                    key: config.key
                                };
                                console.log('[UnifiedStorage-DEBUG] ✅ MinIO 上传成功!');
                                console.log('[UnifiedStorage-DEBUG] 🔗 文件URL:', result.url);
                                console.log('[UnifiedStorage-DEBUG] 🔑 文件Key:', result.key);
                                resolve(result);
                            } else {
                                const error = new Error(`MinIO POST 上传失败，状态码: ${res.statusCode}, 响应: ${res.data}`);
                                console.error('[UnifiedStorage-DEBUG] ❌ MinIO 上传失败 - 状态码错误:', error);
                                reject(error);
                            }
                        },
                        fail: (error) => {
                            console.error('[UnifiedStorage-DEBUG] ❌ MinIO 上传失败 - 请求失败:');
                            console.error('[UnifiedStorage-DEBUG] ❌ 错误码:', error.errMsg);
                            console.error('[UnifiedStorage-DEBUG] ❌ 完整错误:', error);
                            reject(new Error(`MinIO POST 上传失败: ${error.errMsg}`));
                        }
                    });
                },
                fail: (error) => {
                    console.error('[UnifiedStorage-DEBUG] ❌ 文件信息检查失败:');
                    console.error('[UnifiedStorage-DEBUG] ❌ 文件路径:', filePath);
                    console.error('[UnifiedStorage-DEBUG] ❌ 错误信息:', error);
                    reject(new Error(`文件不可访问: ${error.errMsg}`));
                }
            });
        });
    }

    /**
     * 新版OSS直传
     * @param {string} filePath - 文件路径
     * @param {Object} config - 存储配置
     * @returns {Promise<{url: string, key: string}>}
     */
    async uploadWithOSS(filePath, config) {
        if (!config.formData) {
            throw new Error('OSS 配置获取失败');
        }

        console.log('[UnifiedStorage] OSS 上传配置:', {
            baseUrl: config.baseUrl,
            key: config.formData.key,
            formDataKeys: Object.keys(config.formData)
        });

        return new Promise((resolve, reject) => {
            wx.uploadFile({
                url: config.baseUrl,
                filePath,
                name: 'file',
                formData: config.formData,
                success: (res) => {
                    console.log('[UnifiedStorage] OSS 上传响应:', {
                        statusCode: res.statusCode,
                        data: res.data
                    });
                    
                    try {
                        const data = JSON.parse(res.data);
                        if (data.code === 200) {
                            const result = {
                                url: `${config.baseUrl}/${config.formData.key}`,
                                key: config.formData.key
                            };
                            console.log('[UnifiedStorage] OSS 上传成功:', result);
                            resolve(result);
                        } else {
                            const error = new Error(data.message || 'OSS上传失败');
                            console.error('[UnifiedStorage] OSS 上传失败:', error);
                            reject(error);
                        }
                    } catch (e) {
                        const error = new Error('OSS响应解析失败');
                        console.error('[UnifiedStorage] OSS 响应解析失败:', e);
                        reject(error);
                    }
                },
                fail: (error) => {
                    console.error('[UnifiedStorage] OSS 上传失败:', error);
                    reject(new Error(`OSS上传失败: ${error.errMsg}`));
                }
            });
        });
    }

    /**
     * 服务器上传（支持 local 和 minio 模式）
     * @param {string} filePath - 文件路径
     * @param {Object} config - 存储配置
     * @param {string} dir - 目录
     * @returns {Promise<{url: string, key: string}>}
     */
    async uploadWithServer(filePath, config, dir = '') {
        if (!config.uploadUrl) {
            throw new Error('服务器上传URL获取失败');
        }

        console.log('[UnifiedStorage] 服务器上传配置:', {
            uploadUrl: config.uploadUrl,
            baseUrl: config.baseUrl,
            dir: dir
        });

        // 先检查文件是否可访问
        return new Promise((resolve, reject) => {
            wx.getFileInfo({
                filePath: filePath,
                success: (fileInfo) => {
                    console.log('[UnifiedStorage] 服务器上传文件信息检查成功:', fileInfo);
                    
                    // 准备表单数据
                    const formData = {};
                    if (dir) {
                        formData.dir = dir;
                    }
                    
                    // 文件可访问，开始上传
                    wx.uploadFile({
                        url: `${config.baseUrl}${config.uploadUrl}`,
                        filePath,
                        name: 'file',
                        formData,
                        header: {
                            'ipms-pc-token': storage.token()
                        },
                        success: (res) => {
                            console.log('[UnifiedStorage] 服务器上传响应:', {
                                statusCode: res.statusCode,
                                data: res.data
                            });
                            
                            try {
                                const data = JSON.parse(res.data);
                                if (data.code === 200) {
                                    console.log('[UnifiedStorage] 服务器上传成功:', data.data);
                                    resolve({
                                        url: data.data.url,
                                        key: data.data.key
                                    });
                                } else {
                                    const error = new Error(data.message || '服务器上传失败');
                                    console.error('[UnifiedStorage] 服务器上传失败:', error);
                                    reject(error);
                                }
                            } catch (e) {
                                console.error('[UnifiedStorage] 服务器响应解析失败:', e);
                                reject(new Error('服务器响应解析失败'));
                            }
                        },
                        fail: (error) => {
                            console.error('[UnifiedStorage] 服务器上传失败:', error);
                            reject(new Error(`服务器上传失败: ${error.errMsg}`));
                        }
                    });
                },
                fail: (error) => {
                    console.error('[UnifiedStorage] 服务器上传文件不可访问:', error);
                    reject(new Error(`文件不可访问: ${error.errMsg}`));
                }
            });
        });
    }

    /**
     * 原有OSS上传（完全保留现有逻辑）
     * @param {string} filePath - 文件路径
     * @param {string} filename - 文件名
     * @param {string} dir - 目录
     * @returns {Promise<{url: string, key: string}>}
     */
    async uploadWithLegacyOSS(filePath, filename, dir = '') {
        console.log('[UnifiedStorage] 使用原有OSS上传逻辑');
        
        try {
            const hash = await file.md5(filePath);
            const fileName = dir ? `${dir}/${hash}${file.ext(filePath)}` : `${hash}${file.ext(filePath)}`;
            const sign = await ossLegacy(fileName);
            
            console.log('[UnifiedStorage] OSS签名获取成功:', {
                host: sign.host,
                key: sign.key
            });
            
            return new Promise((resolve, reject) => {
                wx.uploadFile({
                    url: sign.host,
                    filePath,
                    name: 'file',
                    formData: sign,
                    success: (res) => {
                        console.log('[UnifiedStorage] 原有OSS上传成功');
                        resolve({
                            url: `/${sign.key}`,
                            key: sign.key
                        });
                    },
                    fail: (error) => {
                        console.error('[UnifiedStorage] 原有OSS上传失败:', error);
                        reject(new Error(`OSS上传失败: ${error.errMsg}`));
                    }
                });
            });
        } catch (error) {
            console.error('[UnifiedStorage] 原有OSS上传流程失败:', error);
            throw error;
        }
    }

    /**
     * 清除配置缓存
     */
    clearCache() {
        console.log('[UnifiedStorage] 清除配置缓存');
        this.config = null;
        this.configExpire = 0;
    }

    /**
     * 向后兼容的方法名
     */
    async uploadWithLocal(filePath, filename, config, dir = '') {
        return this.uploadWithServer(filePath, config, dir);
    }
}

// 导出单例实例
export default new UnifiedStorageService();
