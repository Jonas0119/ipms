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

import fs from 'fs';
import path from 'path';
import config from '~/config';
import { IUploadService, LocalUploadSign, UploadResult } from '~/types/upload';

export class LocalUploadService implements IUploadService {
    constructor() {
        // 确保上传目录存在
        this.ensureUploadDirExists();
    }

    getUploadSign(): LocalUploadSign {
        const expire = Date.now() + 60 * 30 * 1000; // 30分钟有效期
        const dir = '';

        return {
            uploadUrl: '/pc/upload/local',
            expire,
            dir
        };
    }

    async handleFileUpload(ctx: any): Promise<UploadResult> {
        const files = ctx.request.files;

        if (!files || !files.file) {
            throw new Error('No file uploaded');
        }

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const { savePath } = config.upload.local!;

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
        const fullPath = path.join(process.cwd(), savePath, filename);

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

        // 返回可访问的URL
        const url = `${config.upload.local!.urlPrefix}/${filename}`;

        return {
            url,
            key: filename
        };
    }

    private ensureUploadDirExists(): void {
        const { savePath } = config.upload.local!;
        const fullPath = path.join(process.cwd(), savePath);

        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    }
}
