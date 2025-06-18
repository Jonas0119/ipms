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

import crypto from 'crypto';
import config from '~/config';
import { IStorageService, StorageConfig, UploadResult } from '~/types/storage';

export class OssStorageService implements IStorageService {
    getUploadConfig(filename?: string, mimetype?: string, directory?: string): StorageConfig {
        const { accessKeyId, accessKeySecret, bucket, region, customDomain } = config.storage.oss!;
        const expire = Date.now() + 60 * 30 * 1000; // 30分钟有效期

        // 构建OSS上传策略
        const dir = 'uploads/';
        const host = `https://${bucket}.${region}.aliyuncs.com`;

        const policyText = {
            expiration: new Date(expire).toISOString(),
            conditions: [
                ['content-length-range', 0, 1048576000], // 最大1GB
                ['starts-with', '$key', dir]
            ]
        };

        const policy = Buffer.from(JSON.stringify(policyText)).toString('base64');
        const signature = crypto
            .createHmac('sha1', accessKeySecret)
            .update(policy)
            .digest('base64');

        return {
            mode: 'oss',
            baseUrl: customDomain || host,
            expire,
            policy,
            signature,
            accessid: accessKeyId,
            host,
            dir
        };
    }

    async handleFileUpload(ctx: any): Promise<UploadResult> {
        // OSS使用直传，这里主要处理上传后的回调
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
        const { customDomain, bucket, region } = config.storage.oss!;
        const baseUrl = customDomain || `https://${bucket}.${region}.aliyuncs.com`;
        return `${baseUrl}/${key}`;
    }

    async deleteFile(key: string): Promise<boolean> {
        try {
            // 这里应该使用OSS SDK删除文件
            console.log('OSS delete file:', key);
            return true;
        } catch (error) {
            console.error('OSS delete file error:', error);
            return false;
        }
    }

    async fileExists(key: string): Promise<boolean> {
        try {
            // 这里应该使用OSS SDK检查文件存在
            console.log('OSS check file exists:', key);
            return true;
        } catch (error) {
            return false;
        }
    }
}
