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
import { IUploadService } from '~/types/upload';
import { OssUploadService } from './oss-upload';
import { LocalUploadService } from './local-upload';

export class UploadServiceFactory {
    private static ossService: OssUploadService;
    private static localService: LocalUploadService;

    static getUploadService(): IUploadService {
        const { mode } = config.upload;

        switch (mode) {
            case 'oss':
                if (!this.ossService) {
                    this.ossService = new OssUploadService();
                }
                return this.ossService;

            case 'local':
                if (!this.localService) {
                    this.localService = new LocalUploadService();
                }
                return this.localService;

            default:
                throw new Error(`Unsupported upload mode: ${mode}`);
        }
    }

    static isLocalMode(): boolean {
        return config.upload.mode === 'local';
    }

    static isOssMode(): boolean {
        return config.upload.mode === 'oss';
    }
}
