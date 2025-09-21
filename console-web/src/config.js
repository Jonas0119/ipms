/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import assetManager from '@/utils/asset-manager';
import mapConfigManager from '@/utils/map-manager';

export const TOKEN_ID = 'IPMS_PC_TOKEN';

export const USER_ID = 'IPMS_PC_USER_ID';

export const AUTH_HEADER_NAME = 'ipms-pc-token';

export const SITE_TITLE = '智慧物业管理平台';

export const DEGAULT_PAGE_SIZE = 10;

export const FORM_ADAPT_WIDTH = 992;

export const HOST_NAME = '172.18.0.6';  
//export const HOST_NAME = '127.0.0.1';

// 动态获取资源主机地址
export const getAssetHost = async () => {
    const config = await assetManager.getStorageConfig();
    return config.baseUrl;
};

// 兼容性：保留ASSET_HOST但标记为废弃
// @deprecated 请使用 getAssetHost() 或 assetManager.buildAssetUrl()
export const ASSET_HOST = '';

// 动态获取地图API Key
export const getMapKey = async () => {
    const config = await mapConfigManager.getMapConfig();
    return config.key;
};

// 动态获取地图SecretKey
export const getMapSecretKey = async () => {
    const config = await mapConfigManager.getMapConfig();
    return config.secretKey;
};

// 兼容性：保留MAP_KEY但标记为废弃
// @deprecated 请使用 getMapKey() 或 mapConfigManager.getMapKey()
//export const MAP_KEY = '';

// 兼容性：保留MAP_SECRET_KEY但标记为废弃
// @deprecated 请使用 getMapSecretKey() 或 mapConfigManager.getMapSecretKey()
//export const MAP_SECRET_KEY = '';
