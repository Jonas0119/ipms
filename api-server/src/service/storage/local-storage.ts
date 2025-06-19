/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import config from '~/config';
import { IStorageService, StorageConfig, UploadResult } from '~/types/storage';

export class LocalStorageService implements IStorageService {
    constructor() {
        // 确保上传目录存在
        this.ensureUploadDirExists();
    }

    getUploadConfig(filename?: string, mimetype?: string, directory?: string): StorageConfig {
        const expire = Date.now() + 60 * 30 * 1000; // 30分钟有效期

        return {
            mode: 'local',
            baseUrl: this.getBaseUrl(),
            expire,
            uploadUrl: '/pc/upload/local'
        };
    }

    async handleFileUpload(ctx: any): Promise<UploadResult> {
        const files = ctx.request.files;

        if (!files || !files.file) {
            throw new Error('No file uploaded');
        }

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const { savePath } = config.storage.local!;

        // 获取目录参数
        const directory = ctx.request.body?.dir || 'uploads';

        // 生成文件名和路径
        const timestamp = Date.now();
        const random = Math.random()
            .toString(36)
            .substring(2, 15);
        const originalName = file.originalFilename || file.name || '';
        let ext = path.extname(originalName);

        // 确保总是有扩展名 - 如果没有扩展名，根据MIME类型添加
        if (!ext) {
            const mimeType = file.mimetype || file.type || '';
            if (mimeType.includes('png')) {
                ext = '.png';
            } else if (mimeType.includes('gif')) {
                ext = '.gif';
            } else if (mimeType.includes('webp')) {
                ext = '.webp';
            } else {
                // 默认为jpg
                ext = '.jpg';
            }
        }

        const filename = `${timestamp}_${random}${ext}`;
        // 使用目录参数构建完整路径
        const relativePath = path.join(directory, filename);
        const fullPath = path.join(process.cwd(), savePath, relativePath);

        // 确保目录存在
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // 移动文件到目标位置
        const filePath = file.filepath || file.path;
        if (filePath && fs.existsSync(filePath)) {
            fs.copyFileSync(filePath, fullPath);
            // 删除临时文件
            try {
                fs.unlinkSync(filePath);
            } catch (e) {
                // 忽略删除错误
            }
        } else {
            throw new Error('Upload file not found');
        }

        return {
            url: this.getFileUrl(relativePath),
            key: relativePath
        };
    }

    getFileUrl(key: string): string {
        const baseUrl = this.getBaseUrl();
        const { urlPrefix } = config.storage.local!;
        return `${baseUrl}${urlPrefix}/${key}`;
    }

    async deleteFile(key: string): Promise<boolean> {
        try {
            const { savePath } = config.storage.local!;
            // key现在可能包含目录路径，如 "avatar/filename.jpg"
            const fullPath = path.join(process.cwd(), savePath, key);

            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Local delete file error:', error);
            return false;
        }
    }

    async fileExists(key: string): Promise<boolean> {
        try {
            const { savePath } = config.storage.local!;
            // key现在可能包含目录路径，如 "avatar/filename.jpg"
            const fullPath = path.join(process.cwd(), savePath, key);
            return fs.existsSync(fullPath);
        } catch (error) {
            return false;
        }
    }

    private getBaseUrl(): string {
        return config.storage.local!.baseUrl;
    }

    private ensureUploadDirExists(): void {
        const { savePath } = config.storage.local!;
        const fullPath = path.join(process.cwd(), savePath);

        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    }
}
