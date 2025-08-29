/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Middleware, DefaultState, DefaultContext } from 'koa';

/**
 * IP地址处理中间件
 * 用于获取客户端真实IP地址，优先从代理服务器的 X-Real-IP 头部获取
 * 主要用于处理反向代理（如Nginx）后的真实客户端IP识别
 * 
 * @returns Koa中间件函数
 */
function IpMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx, next) => {
        // 优先使用代理服务器传递的真实IP（X-Real-IP头部）
        // 如果没有该头部信息，则使用Koa默认解析的IP地址
        // 这样可以确保在使用Nginx等反向代理时能获取到客户端的真实IP
        ctx.request.ip = (ctx.request.header['x-real-ip'] as string) || ctx.request.ip;

        // 继续执行下一个中间件
        await next();
    };
}

export default IpMiddleware;
