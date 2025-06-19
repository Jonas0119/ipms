/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import config from '~/config';
import { IStorageService } from '~/types/storage';
import { LocalStorageService } from './local-storage';
import { OssStorageService } from './oss-storage';
import { MinioStorageService } from './minio-storage';

export class StorageServiceFactory {
    private static localService: LocalStorageService;
    private static ossService: OssStorageService;
    private static minioService: MinioStorageService;

    static getStorageService(): IStorageService {
        const { mode } = config.storage;

        switch (mode) {
            case 'local':
                if (!this.localService) {
                    this.localService = new LocalStorageService();
                }
                return this.localService;

            case 'oss':
                if (!this.ossService) {
                    this.ossService = new OssStorageService();
                }
                return this.ossService;

            case 'minio':
                if (!this.minioService) {
                    this.minioService = new MinioStorageService();
                }
                return this.minioService;

            default:
                throw new Error(`Unsupported storage mode: ${mode}`);
        }
    }

    static isLocalMode(): boolean {
        return config.storage.mode === 'local';
    }

    static isOssMode(): boolean {
        return config.storage.mode === 'oss';
    }

    static isMinioMode(): boolean {
        return config.storage.mode === 'minio';
    }

    static getCurrentMode(): string {
        return config.storage.mode;
    }

    static getBaseUrl(): string {
        const { mode } = config.storage;

        switch (mode) {
            case 'local':
                return config.storage.local!.baseUrl;
            case 'oss':
                return config.storage.oss!.customDomain || config.storage.oss!.baseUrl;
            case 'minio':
                return config.storage.minio!.customDomain || config.storage.minio!.baseUrl;
            default:
                return 'http://127.0.0.1:6688';
        }
    }
}
