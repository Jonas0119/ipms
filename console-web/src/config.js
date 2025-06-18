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

import assetManager from '@/utils/asset-manager';

export const TOKEN_ID = 'EJYY_PC_TOKEN';

export const USER_ID = 'EJYY_PC_USER_ID';

export const AUTH_HEADER_NAME = 'ejyy-pc-token';

export const SITE_TITLE = 'e家宜业';

export const DEGAULT_PAGE_SIZE = 10;

export const FORM_ADAPT_WIDTH = 992;

export const HOST_NAME = '172.17.0.5';

// 动态获取资源主机地址
export const getAssetHost = async () => {
    const config = await assetManager.getStorageConfig();
    return config.baseUrl;
};

// 兼容性：保留ASSET_HOST但标记为废弃
// @deprecated 请使用 getAssetHost() 或 assetManager.buildAssetUrl()
export const ASSET_HOST = '';

export const MAP_KEY = '';
