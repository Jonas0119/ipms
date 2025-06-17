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

import config from '~/config';
import { IStorageService, StorageConfig, UploadResult } from '~/types/storage';

export class MinioStorageService implements IStorageService {
    getUploadConfig(): StorageConfig {
        const { endpoint, accessKey, secretKey, bucket } = config.storage.minio!;
        const expire = Date.now() + 60 * 30 * 1000; // 30分钟有效期

        // 生成唯一的文件key
        const timestamp = Date.now();
        const random = Math.random()
            .toString(36)
            .substring(2, 15);
        const key = `${timestamp}_${random}`;

        // 这里简化处理，实际应该使用MinIO SDK生成预签名URL
        const presignedUrl = `${endpoint}/${bucket}/${key}`;

        return {
            mode: 'minio',
            baseUrl: this.getBaseUrl(),
            expire,
            presignedUrl,
            bucket,
            endpoint,
            accessKey,
            secretKey
        };
    }

    async handleFileUpload(ctx: any): Promise<UploadResult> {
        // MinIO使用预签名URL直接上传，这里主要处理上传后的回调
        const { key } = ctx.request.body;

        if (!key) {
            throw new Error('Missing file key');
        }

        return {
            url: this.getFileUrl(key),
            key
        };
    }

    getFileUrl(key: string): string {
        const baseUrl = this.getBaseUrl();
        const { bucket } = config.storage.minio!;
        return `${baseUrl}/${bucket}/${key}`;
    }

    async deleteFile(key: string): Promise<boolean> {
        try {
            // 这里应该使用MinIO SDK删除文件
            console.log('MinIO delete file:', key);
            return true;
        } catch (error) {
            console.error('MinIO delete file error:', error);
            return false;
        }
    }

    async fileExists(key: string): Promise<boolean> {
        try {
            // 这里应该使用MinIO SDK检查文件存在
            console.log('MinIO check file exists:', key);
            return true;
        } catch (error) {
            return false;
        }
    }

    private getBaseUrl(): string {
        const { customDomain, baseUrl } = config.storage.minio!;
        return customDomain || baseUrl;
    }
}
