/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import * as Minio from 'minio';
import { URL } from 'url';
import config from '~/config';
import { IStorageService, StorageConfig, UploadResult } from '~/types/storage';

export class MinioStorageService implements IStorageService {
    private minioClient: Minio.Client;

    constructor() {
        const { endpoint, accessKey, secretKey, useSSL } = config.storage.minio!;

        // 解析endpoint，提取host和port
        const url = new URL(endpoint);

        this.minioClient = new Minio.Client({
            endPoint: url.hostname,
            port: url.port ? parseInt(url.port) : useSSL ? 443 : 9000,
            useSSL: useSSL || false,
            accessKey,
            secretKey
        });
    }

    async getUploadConfig(filename?: string, mimetype?: string, directory?: string): Promise<StorageConfig> {
        const { bucket } = config.storage.minio!;
        const expire = Date.now() + 60 * 30 * 1000; // 30分钟有效期

        // 添加调试日志
        console.log('MinIO getUploadConfig params:', {
            filename,
            mimetype,
            directory
        });

        try {
            // 先尝试检查bucket是否存在，如果不存在则创建
            const bucketExists = await this.minioClient.bucketExists(bucket);
            if (!bucketExists) {
                console.log(`Creating MinIO bucket: ${bucket}`);
                await this.minioClient.makeBucket(bucket, 'us-east-1');

                // 设置存储桶为公开访问
                await this.setBucketPublicPolicy(bucket);
            } else {
                // 如果存储桶已存在，也检查并设置公开访问策略
                await this.setBucketPublicPolicy(bucket);
            }

            // 生成唯一的文件key，包含扩展名
            const timestamp = Date.now();
            const random = Math.random()
                .toString(36)
                .substring(2, 15);

            // 确定文件扩展名
            let ext = '';
            if (filename) {
                const dotIndex = filename.lastIndexOf('.');
                if (dotIndex > 0 && dotIndex < filename.length - 1) {
                    // 确保点号不在开头或结尾，且后面有内容
                    ext = filename.substring(dotIndex);
                }
            }

            // 如果文件名没有扩展名，尝试根据MIME类型推断
            if (!ext && mimetype) {
                if (mimetype.includes('png')) {
                    ext = '.png';
                } else if (mimetype.includes('gif')) {
                    ext = '.gif';
                } else if (mimetype.includes('webp')) {
                    ext = '.webp';
                } else if (mimetype.includes('jpeg') || mimetype.includes('jpg')) {
                    ext = '.jpg';
                } else if (mimetype.includes('image')) {
                    ext = '.jpg'; // 默认图片扩展名
                }
            }

            // 如果仍然没有扩展名，使用默认的jpg扩展名（适用于图片上传）
            if (!ext) {
                ext = '.jpg';
            }

            // 使用指定的目录或默认的uploads目录
            const dir = directory || 'uploads';
            const key = `${dir}/${timestamp}_${random}${ext}`;

            // 生成预签名上传URL
            const presignedUrl = await this.minioClient.presignedPutObject(
                bucket,
                key,
                30 * 60 // 30分钟有效期
            );

            console.log('MinIO presigned URL generated successfully');
            return {
                mode: 'minio',
                baseUrl: this.getBaseUrl(),
                expire,
                presignedUrl,
                bucket,
                key,
                endpoint: config.storage.minio!.endpoint,
                accessKey: config.storage.minio!.accessKey,
                secretKey: config.storage.minio!.secretKey
            };
        } catch (error) {
            console.warn('MinIO connection failed, falling back to server upload:', error.message);
            // 如果预签名失败，回退到服务端上传
            return {
                mode: 'minio',
                baseUrl: this.getBaseUrl(),
                expire,
                uploadUrl: '/pc/storage/upload'
            };
        }
    }

    async handleFileUpload(ctx: any): Promise<UploadResult> {
        const files = ctx.request.files;

        if (!files || !files.file) {
            throw new Error('No file uploaded');
        }

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const { bucket } = config.storage.minio!;

        // 生成文件名和路径
        const timestamp = Date.now();
        const random = Math.random()
            .toString(36)
            .substring(2, 15);
        const originalName = file.originalFilename || file.name || '';
        let ext = originalName.substring(originalName.lastIndexOf('.'));

        // 确保总是有扩展名
        if (!ext) {
            const mimeType = file.mimetype || file.type || '';
            if (mimeType.includes('png')) {
                ext = '.png';
            } else if (mimeType.includes('gif')) {
                ext = '.gif';
            } else if (mimeType.includes('webp')) {
                ext = '.webp';
            } else {
                ext = '.jpg';
            }
        }

        const key = `uploads/${timestamp}_${random}${ext}`;

        try {
            // 检查bucket是否存在
            const bucketExists = await this.minioClient.bucketExists(bucket);
            if (!bucketExists) {
                await this.minioClient.makeBucket(bucket, 'us-east-1');
                // 设置存储桶为公开访问
                await this.setBucketPublicPolicy(bucket);
            }

            // 上传文件到MinIO
            const filePath = file.filepath || file.path;
            await this.minioClient.fPutObject(bucket, key, filePath);

            return {
                url: this.getFileUrl(key),
                key
            };
        } catch (error) {
            console.error('MinIO upload error:', error);
            throw new Error('MinIO文件上传失败');
        }
    }

    getFileUrl(key: string): string {
        const baseUrl = this.getBaseUrl();
        const { bucket } = config.storage.minio!;
        return `${baseUrl}/${bucket}/${key}`;
    }

    async deleteFile(key: string): Promise<boolean> {
        try {
            const { bucket } = config.storage.minio!;
            await this.minioClient.removeObject(bucket, key);
            return true;
        } catch (error) {
            console.error('MinIO delete file error:', error);
            return false;
        }
    }

    async fileExists(key: string): Promise<boolean> {
        try {
            const { bucket } = config.storage.minio!;
            await this.minioClient.statObject(bucket, key);
            return true;
        } catch (error) {
            return false;
        }
    }

    private getBaseUrl(): string {
        const { customDomain, baseUrl } = config.storage.minio!;
        return customDomain || baseUrl;
    }

    /*     * 设置存储桶为公开访问
     * 允许所有用户读取存储桶中的文件
     */
    private async setBucketPublicPolicy(bucket: string): Promise<void> {
        try {
            // 定义公开读取策略
            const publicReadPolicy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${bucket}/*`]
                    }
                ]
            };

            // 设置存储桶策略
            await this.minioClient.setBucketPolicy(bucket, JSON.stringify(publicReadPolicy));
            console.log(`MinIO bucket ${bucket} set to public read access`);
        } catch (error) {
            console.warn(`Failed to set public policy for bucket ${bucket}:`, error.message);
            // 不抛出错误，因为这不是关键功能
        }
    }
}
