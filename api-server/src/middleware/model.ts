/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Middleware, DefaultState, DefaultContext } from 'koa';
import Knex from 'knex';
import model from '~/model';

/**
 * 扩展 Koa 的 Context 类型定义
 * 为所有请求上下文添加 model 属性，类型为 Knex 实例
 * 这样可以在所有路由处理函数中直接使用 ctx.model 进行数据库操作
 */
declare module 'koa' {
    interface BaseContext {
        model: Knex;
    }
}

/**
 * 数据库模型中间件
 * 
 * 主要功能：
 * 1. 将全局的数据库连接实例注入到每个请求的上下文中
 * 2. 使所有路由处理函数都能通过 ctx.model 访问数据库
 * 3. 提供统一的数据库操作接口，简化代码编写
 * 
 * 使用方式：
 * - 在路由处理函数中可以直接使用 ctx.model.table('table_name') 进行数据库查询
 * - 支持 Knex.js 的所有查询方法，如 select、insert、update、delete 等
 * - 自动处理数据库连接的生命周期管理
 * 
 * @returns Koa中间件函数
 */
function ModelMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx, next) => {
        // 将全局数据库模型实例注入到请求上下文中
        // 这样每个请求都能访问到数据库连接
        ctx.model = model;

        // 继续执行下一个中间件
        await next();
    };
}

export default ModelMiddleware;
