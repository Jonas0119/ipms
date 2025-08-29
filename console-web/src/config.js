/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import assetManager from '@/utils/asset-manager';

export const TOKEN_ID = 'IPMS_PC_TOKEN';

export const USER_ID = 'IPMS_PC_USER_ID';

export const AUTH_HEADER_NAME = 'ipms-pc-token';

export const SITE_TITLE = '智慧物业管理平台';

export const DEGAULT_PAGE_SIZE = 10;

export const FORM_ADAPT_WIDTH = 992;

export const HOST_NAME = '172.17.0.6';  
//export const HOST_NAME = '127.0.0.1';

// 动态获取资源主机地址
export const getAssetHost = async () => {
    const config = await assetManager.getStorageConfig();
    return config.baseUrl;
};

// 兼容性：保留ASSET_HOST但标记为废弃
// @deprecated 请使用 getAssetHost() 或 assetManager.buildAssetUrl()
export const ASSET_HOST = '';

export const MAP_KEY = '';
