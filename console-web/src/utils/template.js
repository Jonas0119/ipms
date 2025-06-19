/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import * as utils from '@/utils';
import { Message } from 'view-design';

class TemplateService {
    constructor() {
        this.templateConfig = null;
        this.configExpire = 0;
    }

    /*     * 获取模板配置（带缓存）
     */
    async getTemplateConfig() {
        const now = Date.now();

        // 配置缓存机制，缓存5分钟
        if (!this.templateConfig || this.configExpire < now) {
            try {
                const response = await utils.request.get('/template/config');
                this.templateConfig = response.data;
                this.configExpire = now + 5 * 60 * 1000; // 5分钟缓存
            } catch (error) {
                console.error('获取模板配置失败:', error);
                throw new Error('无法获取模板配置，请检查网络连接');
            }
        }

        return this.templateConfig;
    }

    /*     * 下载模板文件
     * @param {string} templateType 模板类型
     * @param {Object} options 下载选项
     */
    async downloadTemplate(templateType, options = {}) {
        try {
            const config = await this.getTemplateConfig();
            const template = config.templates[templateType];

            if (!template) {
                throw new Error('模板不存在');
            }

            // 如果有直链，优先使用直链下载
            if (template.directUrl && !options.forceApi) {
                this.downloadByUrl(template.directUrl, template.name);
                return;
            }

            // 否则通过API下载
            await this.downloadByApi(template.downloadUrl, template.name);
        } catch (error) {
            console.error('模板下载失败:', error);
            Message.error('模板下载失败: ' + (error.message || '未知错误'));
            throw error;
        }
    }

    /*     * 通过URL直接下载
     * @param {string} url 下载URL
     * @param {string} filename 文件名
     */
    downloadByUrl(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /*     * 通过API下载
     * @param {string} apiUrl API地址
     * @param {string} filename 文件名
     */
    async downloadByApi(apiUrl, filename) {
        try {
            const response = await utils.request({
                url: apiUrl,
                method: 'get',
                responseType: 'blob'
            });

            // 创建下载链接
            const blob = new Blob([response], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('API下载失败:', error);
            throw new Error('下载失败: ' + (error.message || '网络错误'));
        }
    }

    /*     * 获取模板列表
     */
    async getTemplateList() {
        const config = await this.getTemplateConfig();
        return Object.entries(config.templates).map(([key, template]) => ({
            key,
            name: template.name,
            downloadUrl: template.downloadUrl,
            directUrl: template.directUrl
        }));
    }

    /*     * 检查模板是否存在
     * @param {string} templateType 模板类型
     */
    async templateExists(templateType) {
        try {
            const config = await this.getTemplateConfig();
            return !!config.templates[templateType];
        } catch (error) {
            return false;
        }
    }

    /*     * 清除缓存
     */
    clearCache() {
        this.templateConfig = null;
        this.configExpire = 0;
    }
}

// 创建单例实例
const templateService = new TemplateService();

export default templateService;
