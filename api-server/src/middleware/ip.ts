/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Middleware, DefaultState, DefaultContext } from 'koa';

function IpMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx, next) => {
        ctx.request.ip = (ctx.request.header['x-real-ip'] as string) || ctx.request.ip;

        await next();
    };
}

export default IpMiddleware;
