/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Message } from 'view-design';
import * as config from '@/config';
import auth from './auth';
import request from './request';

/**
 * 统一地图配置管理类 - 整合地图API配置获取功能
 * 前端零配置，所有地图信息从后端获取
 */
class MapConfigManager {
    constructor() {
        this.mapConfig = null;
        this.configExpire = 0;
    }

    /**
     * 获取地图配置（类似asset-manager的getStorageConfig功能）
     * @param {Object} options - 可选参数
     * @returns {Promise<Object>} 地图配置对象
     */
    async getMapConfig(options = {}) {
        const now = Date.now();

        // 配置缓存机制 - 30分钟内使用缓存
        if (this.mapConfig && this.configExpire >= now + 10000) {
            return this.mapConfig;
        }

        try {
            const response = await request.get('/map/config', { params: options });

            // 缓存配置
            this.mapConfig = response.data;
            this.configExpire = this.mapConfig.expire || now + 30 * 60 * 1000;

            return response.data;
        } catch (error) {
            console.error('获取地图配置失败:', error);
            throw new Error('无法获取地图配置，请检查网络连接');
        }
    }

    /**
     * 清除配置缓存（用于配置更新后强制重新获取）
     */
    clearCache() {
        this.mapConfig = null;
        this.configExpire = 0;
    }

    /**
     * 获取地图API Key
     * @returns {Promise<string>} 地图API Key
     */
    async getMapKey() {
        const config = await this.getMapConfig();
        return config.key;
    }

    /**
     * 获取地图SecretKey
     * @returns {Promise<string>} 地图SecretKey
     */
    async getMapSecretKey() {
        const config = await this.getMapConfig();
        return config.secretKey;
    }

    /**
     * 检查是否启用签名验证
     * @returns {Promise<boolean>} 是否启用签名验证
     */
    async isSignatureEnabled() {
        const config = await this.getMapConfig();
        return config.enableSignature || false;
    }

    /**
     * 获取地图API版本
     * @returns {Promise<string>} API版本
     */
    async getApiVersion() {
        const config = await this.getMapConfig();
        return config.apiVersion || '2.exp';
    }

    /**
     * 获取需要加载的库
     * @returns {Promise<Array>} 库列表
     */
    async getLibraries() {
        const config = await this.getMapConfig();
        return config.libraries || ['visualization'];
    }

    /**
     * 获取默认地图中心点
     * @returns {Promise<Object>} 默认中心点坐标
     */
    async getDefaultCenter() {
        const config = await this.getMapConfig();
        return config.defaultCenter || { lat: 39.908823, lng: 116.397470 };
    }

    /**
     * 获取默认缩放级别
     * @returns {Promise<number>} 默认缩放级别
     */
    async getDefaultZoom() {
        const config = await this.getMapConfig();
        return config.defaultZoom || 15;
    }

    /**
     * 构建腾讯地图API脚本URL
     * @param {Object} options - 选项
     * @param {string} options.version - API版本，默认从配置获取
     * @param {Array} options.libraries - 需要加载的库，默认从配置获取
     * @param {string} options.callback - 回调函数名
     * @returns {Promise<string>} 完整的API脚本URL
     */
    async buildMapScriptUrl(options = {}) {
        const config = await this.getMapConfig();
        const version = options.version || config.apiVersion || '2.exp';
        const libraries = options.libraries || config.libraries || [];
        const callback = options.callback || 'initMap';
        
        let url = `//map.qq.com/api/js?v=${version}&key=${config.key}&callback=${callback}`;
        
        if (libraries.length > 0) {
            url += `&libraries=${libraries.join(',')}`;
        }
        
        return url;
    }

    /**
     * 构建腾讯地图GL API脚本URL（用于智慧大屏等3D地图）
     * @param {Object} options - 选项
     * @param {string} options.version - API版本，默认从配置获取
     * @param {Array} options.libraries - 需要加载的库，默认从配置获取
     * @param {string} options.callback - 回调函数名
     * @returns {Promise<string>} 完整的GL API脚本URL
     */
    async buildMapGlScriptUrl(options = {}) {
        const config = await this.getMapConfig();
        const version = options.version || '1.exp';
        const libraries = options.libraries || config.libraries || [];
        const callback = options.callback || 'initMap';
        
        let url = `//map.qq.com/api/gljs?v=${version}&key=${config.key}&callback=${callback}`;
        
        if (libraries.length > 0) {
            url += `&libraries=${libraries.join(',')}`;
        }
        
        return url;
    }

    /**
     * 验证地图配置是否有效
     * @returns {Promise<boolean>} 配置是否有效
     */
    async validateConfig() {
        try {
            const config = await this.getMapConfig();
            return !!(config.key && config.key.length >= 10);
        } catch (error) {
            return false;
        }
    }
}

// 创建单例
const mapConfigManager = new MapConfigManager();

// 默认导出地图配置管理器
export default mapConfigManager;
