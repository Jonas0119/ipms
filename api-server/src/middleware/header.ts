/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Middleware, DefaultState, DefaultContext } from 'koa';

// 统一 headers 与预检响应：
// - 允许常见方法（POST/GET/OPTIONS）
// - 对 OPTIONS 直接 204 返回，便于跨域预检与前端 SDK 调用
function HeaderMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx: DefaultContext, next) => {
        ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

        if (ctx.method == 'OPTIONS') {
            ctx.body = '';
            return (ctx.status = 204);
        }

        await next();
    };
}

export default HeaderMiddleware;
