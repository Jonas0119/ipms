/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Middleware, DefaultState, DefaultContext } from 'koa';
import Knex from 'knex';
import model from '~/model';

declare module 'koa' {
    interface BaseContext {
        model: Knex;
    }
}

function ModelMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx, next) => {
        ctx.model = model;

        await next();
    };
}

export default ModelMiddleware;
