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

import path from 'path';
import fs from 'fs';
import config from '~/config';
import { StorageServiceFactory } from './storage/storage-factory';

export interface TemplateInfo {
    name: string;
    downloadUrl: string;
    directUrl?: string;
}

export interface TemplateConfig {
    templates: {
        [key: string]: TemplateInfo;
    };
}

export class TemplateService {
    /**
     * 获取模板配置信息
     */
    static getTemplateConfig(): TemplateConfig {
        const { template } = config.storage;

        if (!template || !template.files) {
            return { templates: {} };
        }

        const templates: { [key: string]: TemplateInfo } = {};
        const baseUrl = StorageServiceFactory.getBaseUrl();
        const currentMode = StorageServiceFactory.getCurrentMode();

        Object.entries(template.files).forEach(([key, filename]) => {
            templates[key] = {
                name: filename,
                downloadUrl: `/pc/template/download/${key}`,
                // 如果有自定义域名，提供直链下载
                directUrl: this.getDirectUrl(filename, baseUrl, currentMode)
            };
        });

        return { templates };
    }

    /**
     * 获取模板文件的物理路径
     */
    static getTemplateFilePath(templateType: string): string | null {
        const { template } = config.storage;

        if (!template || !template.files || !template.files[templateType]) {
            return null;
        }

        const filename = template.files[templateType];
        const currentMode = StorageServiceFactory.getCurrentMode();

        switch (currentMode) {
            case 'local':
                const { savePath } = config.storage.local!;
                return path.join(process.cwd(), savePath, template.path, filename);

            case 'oss':
            case 'minio':
                // 对于云存储，返回相对路径，由具体的存储服务处理
                return path.join(template.path, filename);

            default:
                return null;
        }
    }

    /**
     * 检查模板文件是否存在
     */
    static async templateExists(templateType: string): Promise<boolean> {
        const filePath = this.getTemplateFilePath(templateType);

        if (!filePath) {
            return false;
        }

        const currentMode = StorageServiceFactory.getCurrentMode();

        switch (currentMode) {
            case 'local':
                return fs.existsSync(filePath);

            case 'oss':
            case 'minio':
                // 对于云存储，通过存储服务检查
                const storageService = StorageServiceFactory.getStorageService();
                return await storageService.fileExists(filePath);

            default:
                return false;
        }
    }

    /**
     * 获取模板文件的直链URL（如果支持）
     */
    private static getDirectUrl(filename: string, baseUrl: string, mode: string): string | undefined {
        const { template } = config.storage;

        if (!template) {
            return undefined;
        }

        switch (mode) {
            case 'local':
                const { urlPrefix } = config.storage.local!;
                return `${baseUrl}${urlPrefix}/${template.path}/${filename}`;

            case 'oss':
                const { customDomain } = config.storage.oss!;
                if (customDomain) {
                    return `${customDomain}/${template.path}/${filename}`;
                }
                return `${baseUrl}/${template.path}/${filename}`;

            case 'minio':
                const { customDomain: minioDomain } = config.storage.minio!;
                if (minioDomain) {
                    return `${minioDomain}/${template.path}/${filename}`;
                }
                return undefined; // MinIO通常需要预签名URL

            default:
                return undefined;
        }
    }

    /**
     * 获取模板文件流（用于下载）
     */
    static async getTemplateStream(templateType: string): Promise<fs.ReadStream | null> {
        const filePath = this.getTemplateFilePath(templateType);

        if (!filePath) {
            return null;
        }

        const currentMode = StorageServiceFactory.getCurrentMode();

        switch (currentMode) {
            case 'local':
                if (fs.existsSync(filePath)) {
                    return fs.createReadStream(filePath);
                }
                return null;

            case 'oss':
            case 'minio':
                // 对于云存储，这里可以扩展为通过存储服务获取文件流
                // 目前先返回null，让调用方使用直链下载
                return null;

            default:
                return null;
        }
    }
}
