/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import config from '~/config';
import kjhlog from '~/utils/kjhlog';

/**
 * PC端地图配置接口
 * 
 * 接口作用：
 * 1. 为前端地图组件提供地图API配置信息
 * 2. 统一管理地图API Key和SecretKey
 * 3. 支持腾讯地图API的签名验证配置
 * 
 * 调用时机：
 * - 前端地图组件初始化时调用此接口获取地图配置
 * - 支持缓存机制，避免频繁请求
 * - 通常在页面加载时调用
 * 
 * 路由: GET /pc/map/config
 * 权限: 需要系统已初始化（config.inited为true）
 */
const PcMapConfigAction = <Action>{
    router: {
        path: '/map/config',
        method: 'get',
        authRequired: config.inited  // 仅在系统初始化后才需要认证
    },

    response: async ctx => {
        // 记录接口调用日志，便于调试和监控
        kjhlog.info('=== MAP CONFIG API CALLED ===');
        kjhlog.info(`🚀 [MAP-CONFIG-DEBUG] 收到地图配置请求`);
        kjhlog.info(`🌐 [MAP-CONFIG-DEBUG] Request URL: ${ctx.request.url}`);
        kjhlog.info(`📋 [MAP-CONFIG-DEBUG] Request method: ${ctx.request.method}`);
        kjhlog.info(`📤 [MAP-CONFIG-DEBUG] Query string: ${JSON.stringify(ctx.query)}`);
        kjhlog.info(`📋 [MAP-CONFIG-DEBUG] Headers: ${JSON.stringify({
            'ipms-pc-token': ctx.request.header['ipms-pc-token'] ? 'present' : 'missing',
            'wechat-mp-request': ctx.request.header['wechat-mp-request'] || 'not provided',
            'user-agent': ctx.request.header['user-agent'] || 'not provided'
        })}`);

        try {
            // 检测是否为小程序请求
            const isMiniProgram = ctx.request.header['wechat-mp-request'] === 'true';
            const requestType = isMiniProgram ? 'MiniProgram' : 'PC';
            kjhlog.info(`[${requestType}] Map config request started`);

            // 检查地图配置是否有效
            if (!config.map.key || config.map.key === '' || config.map.key.length < 10) {
                kjhlog.warn(`[${requestType}] 地图API Key无效或未配置`);
                throw new Error('地图API Key未配置或无效');
            }

            // 构建地图配置响应
            const mapConfig = {
                key: config.map.key,                    // 腾讯地图API Key
                secretKey: config.map.secretKey || '',  // SecretKey（用于签名验证）
                enableSignature: config.map.enableSignature || false,  // 是否启用签名验证
                expire: Date.now() + 30 * 60 * 1000,   // 配置过期时间（30分钟）
                // 腾讯地图API相关配置
                apiVersion: '2.exp',                    // API版本
                libraries: ['visualization'],           // 需要加载的库
                // 地图默认配置
                defaultCenter: {
                    lat: 39.908823,
                    lng: 116.397470
                },
                defaultZoom: 15
            };

            kjhlog.info(`[${requestType}] Map config prepared:`, {
                hasKey: !!mapConfig.key,
                keyLength: mapConfig.key ? mapConfig.key.length : 0,
                hasSecretKey: !!mapConfig.secretKey,
                enableSignature: mapConfig.enableSignature,
                expire: new Date(mapConfig.expire).toISOString()
            });

            // 返回成功响应
            ctx.body = {
                code: SUCCESS,
                data: mapConfig
            };

            kjhlog.success(`[${requestType}] Map config response sent successfully`);
            kjhlog.info(`📤 [MAP-CONFIG-DEBUG] [${requestType}] 完整响应体:`, JSON.stringify({
                code: SUCCESS,
                data: mapConfig
            }, null, 2));

        } catch (error) {
            // 处理配置获取失败的情况
            const isMiniProgram = ctx.request.header['wechat-mp-request'] === 'true';
            const requestType = isMiniProgram ? 'MiniProgram' : 'PC';
            
            kjhlog.error(`[${requestType}] Get map config error:`, error);
            kjhlog.error(`[${requestType}] Error stack:`, error.stack);
            kjhlog.error(`[${requestType}] Request details:`, {
                url: ctx.request.url,
                method: ctx.request.method,
                headers: {
                    'ipms-pc-token': ctx.request.header['ipms-pc-token'] ? 'provided' : 'missing',
                    'wechat-mp-request': ctx.request.header['wechat-mp-request'] || 'not provided'
                },
                query: ctx.query
            });
            
            // 为小程序提供更友好的错误响应
            const errorMessage = isMiniProgram 
                ? `地图配置获取失败: ${error.message || '请检查网络连接后重试'}`
                : error.message || '获取地图配置失败';
                
            ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: errorMessage,
                ...(isMiniProgram && { 
                    debug: {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                })
            };
        }
    }
};

export default PcMapConfigAction;
