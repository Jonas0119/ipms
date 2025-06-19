/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Middleware, DefaultState, DefaultContext } from 'koa';

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
