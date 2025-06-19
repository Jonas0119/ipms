/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
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
    /*     * 获取模板配置信息
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

    /*     * 获取模板文件的物理路径
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

    /*     * 检查模板文件是否存在
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
                try {
                    // 对于云存储，通过存储服务检查
                    const storageService = StorageServiceFactory.getStorageService();
                    if (!storageService.fileExists) {
                        // 如果存储服务不支持fileExists方法，假设文件存在
                        console.warn(`Storage service does not support fileExists method for mode: ${currentMode}`);
                        return true;
                    }
                    return await storageService.fileExists(filePath);
                } catch (error) {
                    console.error(`Error checking template file existence: ${error.message}`);
                    // 出错时假设文件存在，避免阻塞下载功能
                    return true;
                }

            default:
                return false;
        }
    }

    /*     * 获取模板文件的直链URL（如果支持）
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
                const { customDomain: minioDomain, bucket } = config.storage.minio!;
                if (minioDomain) {
                    return `${minioDomain}/${template.path}/${filename}`;
                }
                // 对于MinIO，即使没有自定义域名，也可以提供直链
                // 但这需要存储桶是公开访问的
                return `${baseUrl}/${bucket}/${template.path}/${filename}`;

            default:
                return undefined;
        }
    }

    /*     * 获取模板文件流（用于下载）
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
                // 对于云存储，优先使用直链下载
                // 如果没有直链，返回null让调用方使用API下载模式
                console.log(`Template file for ${templateType} will be downloaded via direct URL or API fallback`);
                return null;

            default:
                return null;
        }
    }
}
