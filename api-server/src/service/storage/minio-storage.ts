/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import * as Minio from 'minio';
import { URL } from 'url';
import config from '~/config';
import { IStorageService, StorageConfig, UploadResult } from '~/types/storage';
import { regeneratePresignedUrl } from '~/utils/aws-signature';

export class MinioStorageService implements IStorageService {
    private minioClient: Minio.Client;

    constructor() {
        const { endpoint, accessKey, secretKey, useSSL } = config.storage.minio!;
        console.log('[MinioStorage] 开始初始化MinIO客户端...');

        // 解析endpoint，提取host和port
        const url = new URL(endpoint);
        console.log('[MinioStorage] 解析endpoint:', {
            originalEndpoint: endpoint,
            hostname: url.hostname,
            port: url.port,
            protocol: url.protocol
        });

        // MinIO客户端（使用内部endpoint确保连接稳定）
        this.minioClient = new Minio.Client({
            endPoint: url.hostname,
            port: url.port ? parseInt(url.port) : useSSL ? 443 : 9000,
            useSSL: useSSL || false,
            accessKey,
            secretKey
        });

        console.log('[MinioStorage] MinIO客户端初始化完成:', {
            endpoint: endpoint,
            host: url.hostname,
            port: url.port || (useSSL ? 443 : 9000),
            useSSL: useSSL,
            hasAccessKey: !!accessKey,
            hasSecretKey: !!secretKey
        });
    }

    async getUploadConfig(filename?: string, mimetype?: string, directory?: string): Promise<StorageConfig> {
        const { bucket } = config.storage.minio!;
        const expire = Date.now() + 60 * 30 * 1000; // 30分钟有效期

        console.log('🚀 [MinioStorage-DEBUG] 开始生成上传配置');
        console.log('📋 [MinioStorage-DEBUG] 输入参数:', {
            filename,
            mimetype,
            directory,
            bucket,
            expire: new Date(expire).toISOString(),
            endpoint: config.storage.minio!.endpoint,
            useSSL: config.storage.minio!.useSSL
        });

        try {
            // 先尝试检查bucket是否存在，如果不存在则创建
            console.log('[MinioStorage] 检查存储桶是否存在...');
            const bucketExists = await this.minioClient.bucketExists(bucket);
            console.log('[MinioStorage] 存储桶检查结果:', { bucket, exists: bucketExists });
            
            if (!bucketExists) {
                console.log(`[MinioStorage] 创建MinIO存储桶: ${bucket}`);
                await this.minioClient.makeBucket(bucket, 'us-east-1');
                console.log(`[MinioStorage] 存储桶创建成功: ${bucket}`);

                // 设置存储桶为公开访问
                console.log('[MinioStorage] 设置存储桶公开访问策略...');
                await this.setBucketPublicPolicy(bucket);
                console.log('[MinioStorage] 存储桶公开访问策略设置完成');
            } else {
                // 如果存储桶已存在，也检查并设置公开访问策略
                console.log('[MinioStorage] 存储桶已存在，检查公开访问策略...');
                await this.setBucketPublicPolicy(bucket);
                console.log('[MinioStorage] 存储桶公开访问策略检查完成');
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
            console.log('[MinioStorage] 生成文件key:', { dir, key, ext, timestamp, random });

            // 使用 presignedPostPolicy 支持 POST 方法上传（兼容微信小程序）
            console.log('[MinioStorage] 开始生成MinIO POST Policy用于直传...');
            
            // 创建 MinIO PostPolicy 对象
            const postPolicy = this.minioClient.newPostPolicy();
            console.log('[MinioStorage] PostPolicy对象创建成功');
            
            // 设置过期时间
            postPolicy.setExpires(new Date(expire));
            console.log('[MinioStorage] 设置过期时间:', new Date(expire).toISOString());
            
            // 设置存储桶和文件键
            postPolicy.setBucket(bucket);
            postPolicy.setKey(key);
            console.log('[MinioStorage] 设置存储桶和文件键:', { bucket, key });
            
            // 设置文件大小限制 (50MB)
            postPolicy.setContentLengthRange(0, 50 * 1024 * 1024);
            console.log('[MinioStorage] 设置文件大小限制: 0-50MB');
            
            // 添加 MIME 类型限制（如果提供）
            if (mimetype) {
                postPolicy.setContentType(mimetype);
                console.log('[MinioStorage] 设置MIME类型限制:', mimetype);
            }

            console.log('[MinioStorage] POST Policy配置完成，开始生成签名...');

            const result = await this.minioClient.presignedPostPolicy(postPolicy);
            console.log('[MinioStorage] MinIO POST Policy生成成功:', {
                postURL: result.postURL,
                formDataKeys: Object.keys(result.formData),
                formDataCount: Object.keys(result.formData).length
            });

            // 构建最终的 formData，包含文件 key
            // MinIO的formData包含policy、signature等字段
            const formData: { [key: string]: any } = {
                ...result.formData,
                key: key
            };

            console.log('[MinioStorage] 最终formData构建完成:', {
                key,
                formDataKeys: Object.keys(formData),
                hasPolicy: !!formData.policy,
                hasSignature: !!formData.signature
            });

            // 修复 postURL，确保使用配置的 customDomain 或 baseUrl
            const baseUrl = this.getBaseUrl();
            const fixedPostURL = `${baseUrl}/${bucket}`;
            
            console.log('🔗 [MinioStorage-DEBUG] 原始 postURL:', result.postURL);
            console.log('🔗 [MinioStorage-DEBUG] 修复后 postURL:', fixedPostURL);

            const finalConfig: StorageConfig = {
                mode: 'minio' as const,
                baseUrl: baseUrl,
                expire,
                uploadStrategy: 'direct' as const,
                postURL: fixedPostURL,
                formData: formData,
                bucket,
                key
            };
            
            console.log('✅ [MinioStorage-DEBUG] MinIO POST 直传配置生成成功!');
            console.log('📋 [MinioStorage-DEBUG] 配置摘要:', {
                mode: finalConfig.mode,
                uploadStrategy: finalConfig.uploadStrategy,
                baseUrl: finalConfig.baseUrl,
                postURL: finalConfig.postURL,
                bucket: finalConfig.bucket,
                key: finalConfig.key,
                formDataKeys: Object.keys(finalConfig.formData),
                expire: new Date(finalConfig.expire).toISOString()
            });
            console.log('📤 [MinioStorage-DEBUG] 完整配置:', JSON.stringify(finalConfig, null, 2));

            return finalConfig;
        } catch (error) {
            console.warn('MinIO POST Policy 生成失败，回退到服务端上传:', error.message);
            console.error('Error details:', error);
            // 如果预签名失败，回退到服务端上传
            return {
                mode: 'minio' as const,
                baseUrl: this.getBaseUrl(),
                expire,
                uploadStrategy: 'server' as const,
                uploadUrl: '/mp/storage/upload'
            };
        }
    }

    async handleFileUpload(ctx: any): Promise<UploadResult> {
        console.log('MinIO handleFileUpload started');
        console.log('Request files:', ctx.request.files);
        
        const files = ctx.request.files;

        if (!files || !files.file) {
            console.error('No file uploaded - files:', files);
            throw new Error('No file uploaded');
        }

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        console.log('File details:', {
            originalFilename: file.originalFilename,
            name: file.name,
            mimetype: file.mimetype,
            type: file.type,
            size: file.size,
            filepath: file.filepath,
            path: file.path
        });

        const { bucket } = config.storage.minio!;
        console.log('Using MinIO bucket:', bucket);

        // 生成文件名和路径
        const timestamp = Date.now();
        const random = Math.random()
            .toString(36)
            .substring(2, 15);
        const originalName = file.originalFilename || file.name || '';
        console.log('Original filename:', originalName);
        
        let ext = originalName.substring(originalName.lastIndexOf('.'));
        console.log('Extracted extension:', ext);

        // 确保总是有扩展名
        if (!ext) {
            console.log('No extension found, determining from mimetype');
            const mimeType = file.mimetype || file.type || '';
            console.log('MIME type:', mimeType);
            
            if (mimeType.includes('png')) {
                ext = '.png';
            } else if (mimeType.includes('gif')) {
                ext = '.gif';
            } else if (mimeType.includes('webp')) {
                ext = '.webp';
            } else {
                ext = '.jpg';
            }
            console.log('Assigned extension:', ext);
        }

        // 尝试从请求体中获取目录信息，默认为 uploads
        const directory = ctx.request.body?.directory || ctx.query?.dir || 'uploads';
        const key = `${directory}/${timestamp}_${random}${ext}`;
        console.log('Generated file key:', key);

        try {
            // 检查bucket是否存在
            console.log('Checking if bucket exists:', bucket);
            const bucketExists = await this.minioClient.bucketExists(bucket);
            console.log('Bucket exists:', bucketExists);
            
            if (!bucketExists) {
                console.log('Creating bucket:', bucket);
                await this.minioClient.makeBucket(bucket, 'us-east-1');
                console.log('Bucket created successfully');
                
                // 设置存储桶为公开访问
                console.log('Setting bucket public policy');
                await this.setBucketPublicPolicy(bucket);
                console.log('Bucket public policy set successfully');
            }

            // 上传文件到MinIO
            const filePath = file.filepath || file.path;
            console.log('Uploading file from path:', filePath);
            console.log('Uploading to bucket:', bucket, 'key:', key);
            
            await this.minioClient.fPutObject(bucket, key, filePath);
            console.log('File uploaded successfully to MinIO');

            const fileUrl = this.getFileUrl(key);
            console.log('Generated file URL:', fileUrl);

            const result = {
                url: fileUrl,
                key
            };
            console.log('Upload result:', result);

            return result;
        } catch (error) {
            console.error('MinIO upload error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                code: error.code
            });
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
