/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import request from './request';
import * as file from './file';
import oss from './oss';
import { TOKEN_NAME } from '../config';

/**
 * 统一存储上传服务
 * 根据后端配置自动选择上传方式：OSS直传、MinIO预签名、本地服务器
 */
class StorageService {
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
        
        // 仅当缓存存在且非直传策略时复用缓存；直传策略需要每次刷新，避免多文件共用同一签名/Key
        if (this.config && this.configExpire > now && this.config.uploadStrategy !== 'direct') {
            return this.config;
        }

        try {
            const res = await request({
                url: '/storage/config',
                method: 'get',
                data: {
                    filename,
                    mimetype,
                    dir
                }
            });

            this.config = res.data;
            this.configExpire = res.data.expire || (now + 30 * 60 * 1000); // 默认30分钟过期
            
            return this.config;
        } catch (error) {
            // 回退到原有OSS逻辑
            return null;
        }
    }

    /**
     * 上传文件
     * @param {string} filePath - 本地文件路径
     * @param {string} filename - 文件名
     * @param {string} mimetype - MIME类型
     * @param {string} dir - 目录
     * @returns {Promise<{url: string, key: string}>} 上传结果
     */
    async upload(filePath, filename, mimetype = 'image/jpeg', dir = '') {
        const config = await this.getConfig(filename, mimetype, dir);
        
        if (!config) {
            // 回退到原有OSS逻辑
            return this.uploadWithOSS(filePath, filename);
        }
        
        // 根据上传策略决定使用哪种上传方式
        switch (config.uploadStrategy) {
            case 'direct':
                if (config.mode === 'minio' && config.postURL) {
                    // MinIO POST 直传
                    return this.uploadWithMinIOPost(filePath, filename, config);
                } else {
                    // OSS 直传
                    return this.uploadWithOSS(filePath, filename, config);
                }
            case 'presigned':
                // MinIO 预签名上传（已弃用，因为与微信小程序不兼容）
                return this.uploadWithMinIO(filePath, filename, config);
            case 'server':
                // 服务器上传（适用于 local 和 minio 模式）
                return this.uploadWithServer(filePath, filename, config, dir);
            default:
                return this.uploadWithOSS(filePath, filename);
        }
    }

    /**
     * OSS直传
     */
    async uploadWithOSS(filePath, filename, config = null) {
        if (config && config.formData) {
            // 使用新配置的OSS参数
            return new Promise((resolve, reject) => {
                wx.uploadFile({
                    url: config.baseUrl,
                    filePath,
                    name: 'file',
                    formData: config.formData,
                    success: (res) => {
                        try {
                            const data = JSON.parse(res.data);
                            if (data.code === 200) {
                                resolve({
                                    url: `${config.baseUrl}/${config.formData.key}`,
                                    key: config.formData.key
                                });
                            } else {
                                reject(new Error(data.message || 'OSS上传失败'));
                            }
                        } catch (e) {
                            reject(new Error('OSS响应解析失败'));
                        }
                    },
                    fail: (error) => {
                        reject(new Error(`OSS上传失败: ${error.errMsg}`));
                    }
                });
            });
        } else {
            // 回退到原有OSS逻辑
            const hash = await file.md5(filePath);
            const fileName = `${dir}/${hash}${file.ext(filePath)}`;
            const sign = await oss(fileName);
            
            return new Promise((resolve, reject) => {
                wx.uploadFile({
                    url: sign.host,
                    filePath,
                    name: 'file',
                    formData: sign,
                    success: () => {
                        resolve({
                            url: `/${sign.key}`,
                            key: sign.key
                        });
                    },
                    fail: (error) => {
                        reject(new Error(`OSS上传失败: ${error.errMsg}`));
                    }
                });
            });
        }
    }

    /**
     * MinIO POST 直传（兼容微信小程序）
     */
    async uploadWithMinIOPost(filePath, filename, config) {
        if (!config.postURL || !config.formData) {
            throw new Error('MinIO POST 配置获取失败');
        }

        // 先检查文件是否可访问
        return new Promise((resolve, reject) => {
            wx.getFileInfo({
                filePath: filePath,
                success: (fileInfo) => {
                    // 文件可访问，开始上传
                    wx.uploadFile({
                        url: config.postURL,
                        filePath,
                        name: 'file',
                        formData: config.formData,
                        success: (res) => {
                            // MinIO POST 上传成功通常返回 204 No Content
                            if (res.statusCode >= 200 && res.statusCode < 300) {
                                const result = {
                                    url: `${config.baseUrl}/${config.bucket}/${config.key}`,
                                    key: config.key
                                };
                                resolve(result);
                            } else {
                                reject(new Error(`MinIO POST 上传失败，状态码: ${res.statusCode}, 响应: ${res.data}`));
                            }
                        },
                        fail: (error) => {
                            reject(new Error(`MinIO POST 上传失败: ${error.errMsg}`));
                        }
                    });
                },
                fail: (error) => {
                    reject(new Error(`文件不可访问: ${error.errMsg}`));
                }
            });
        });
    }

    /**
     * MinIO预签名上传（PUT方法，已弃用）
     */
    async uploadWithMinIO(filePath, filename, config) {
        console.log('MinIO上传配置:', config);
        console.log('预签名URL:', config.presignedUrl);
        console.log('文件路径:', filePath);
        
        if (!config.presignedUrl) {
            throw new Error('MinIO预签名URL获取失败');
        }

        // 先检查文件是否可访问
        return new Promise((resolve, reject) => {
            wx.getFileInfo({
                filePath: filePath,
                success: (fileInfo) => {
                    console.log('文件信息检查成功:', fileInfo);
                    
                    // 文件可访问，开始上传
                    wx.uploadFile({
                        url: config.presignedUrl,
                        filePath,
                        name: 'file',
                        success: (res) => {
                            console.log('MinIO上传响应:', res);
                            console.log('响应状态码:', res.statusCode);
                            console.log('响应数据:', res.data);
                            
                            // 检查响应状态
                            if (res.statusCode >= 200 && res.statusCode < 300) {
                                const result = {
                                    url: `${config.baseUrl}/${config.bucket}/${config.key}`,
                                    key: config.key
                                };
                                console.log('MinIO上传成功，返回结果:', result);
                                resolve(result);
                            } else {
                                console.error('MinIO上传失败，状态码:', res.statusCode);
                                reject(new Error(`MinIO上传失败，状态码: ${res.statusCode}, 响应: ${res.data}`));
                            }
                        },
                        fail: (error) => {
                            console.error('MinIO上传失败:', error);
                            reject(new Error(`MinIO上传失败: ${error.errMsg}`));
                        }
                    });
                },
                fail: (error) => {
                    console.error('文件信息检查失败:', error);
                    reject(new Error(`文件不可访问: ${error.errMsg}`));
                }
            });
        });
    }

    /**
     * 服务器上传（支持 local 和 minio 模式）
     */
    async uploadWithServer(filePath, filename, config, directory = '') {
        console.log('服务器上传配置:', config);
        console.log('上传 URL:', `${config.baseUrl}${config.uploadUrl}`);
        console.log('目录:', directory);
        
        if (!config.uploadUrl) {
            throw new Error('服务器上传URL获取失败');
        }

        // 先检查文件是否可访问
        return new Promise((resolve, reject) => {
            wx.getFileInfo({
                filePath: filePath,
                success: (fileInfo) => {
                    console.log('文件信息检查成功:', fileInfo);
                    
                    // 准备表单数据
                    const formData = {};
                    if (directory) {
                        formData.directory = directory;
                    }
                    
                    // 文件可访问，开始上传
                    wx.uploadFile({
                        url: `${config.baseUrl}${config.uploadUrl}`,
                        filePath,
                        name: 'file',
                        formData,
                        header: {
                            'ipms-mp-token': wx.getStorageSync(TOKEN_NAME) || ''
                        },
                        success: (res) => {
                            console.log('服务器上传响应:', res);
                            console.log('响应状态码:', res.statusCode);
                            console.log('响应数据:', res.data);
                            
                            try {
                                const data = JSON.parse(res.data);
                                if (data.code === 200) {
                                    console.log('服务器上传成功:', data.data);
                                    resolve({
                                        url: data.data.url,
                                        key: data.data.key
                                    });
    } else {
                                    reject(new Error(data.message || '服务器上传失败'));
                                }
                            } catch (e) {
                                console.error('响应解析失败:', e);
                                reject(new Error('服务器响应解析失败'));
                            }
                        },
                        fail: (error) => {
                            console.error('服务器上传失败:', error);
                            reject(new Error(`服务器上传失败: ${error.errMsg}`));
                        }
                    });
                },
                fail: (error) => {
                    console.error('文件信息检查失败:', error);
                    reject(new Error(`文件不可访问: ${error.errMsg}`));
                }
            });
        });
    }

    /**
     * 向后兼容的方法名
     */
    async uploadWithLocal(filePath, filename, config, directory = '') {
        return this.uploadWithServer(filePath, filename, config, directory);
    }

    /**
     * 清除配置缓存
     */
    clearCache() {
        this.config = null;
        this.configExpire = 0;
    }
}

// 导出单例实例
export default new StorageService();