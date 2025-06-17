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

// 统一存储配置接口
export interface StorageConfig {
    mode: 'local' | 'oss' | 'minio';
    baseUrl: string;
    expire: number;

    // 本地上传特有
    uploadUrl?: string;

    // OSS上传特有
    policy?: string;
    signature?: string;
    accessid?: string;
    host?: string;
    dir?: string;

    // MinIO上传特有
    endpoint?: string;
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
    presignedUrl?: string;
}

// 文件上传结果接口
export interface UploadResult {
    url: string;
    key: string;
}

// 统一存储服务接口
export interface IStorageService {
    // 获取上传配置
    getUploadConfig(): Promise<StorageConfig> | StorageConfig;

    // 处理文件上传
    handleFileUpload?(ctx: any): Promise<UploadResult>;

    // 获取文件访问URL
    getFileUrl(key: string): string;

    // 删除文件
    deleteFile?(key: string): Promise<boolean>;

    // 检查文件是否存在
    fileExists?(key: string): Promise<boolean>;
}

// 兼容原有接口
export interface UploadSign {
    policy: string;
    signature: string;
    accessid: string;
    expire: number;
    host: string;
    dir: string;
}

export interface LocalUploadSign {
    uploadUrl: string;
    expire: number;
    dir: string;
}

export interface IUploadService {
    getUploadSign(): UploadSign | LocalUploadSign;
    handleFileUpload?(file: any): Promise<UploadResult>;
}
