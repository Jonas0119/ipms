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

// 上传签名接口
export interface UploadSign {
    policy: string;
    signature: string;
    accessid: string;
    expire: number;
    host: string;
    dir: string;
}

// 本地上传签名接口
export interface LocalUploadSign {
    uploadUrl: string;
    expire: number;
    dir: string;
}

// 文件上传结果接口
export interface UploadResult {
    url: string;
    key: string;
}

// 上传服务抽象接口
export interface IUploadService {
    // 获取上传签名
    getUploadSign(): UploadSign | LocalUploadSign;

    // 处理文件上传（仅本地上传需要）
    handleFileUpload?(file: any): Promise<UploadResult>;
}
