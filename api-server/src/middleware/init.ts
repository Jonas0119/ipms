/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Middleware, DefaultState, DefaultContext } from 'koa';
import config from '~/config';
import utils from '~/utils';
import { TRUE } from '~/constant/status';
import { SYSTEMT_NOT_INIT } from '~/constant/code';

function InitMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx: DefaultContext, next) => {
        const isInitAction = /^\/pc\/init\/\w+$/.test(ctx.request.path);

        if (!config.inited && !/^\/pc\/(upload\/(sign|local)|storage\/(config|upload))$/.test(ctx.request.path)) {
            const total = utils.sql.countReader(
                await ctx.model
                    .from('ipms_property_company_user')
                    .where('admin', TRUE)
                    .count()
            );

            if (total === 0) {
                if (!isInitAction) {
                    return (ctx.body = {
                        code: SYSTEMT_NOT_INIT,
                        message: '系统未初始化'
                    });
                }
            } else {
                config.inited = true;
            }
        } else {
            if (isInitAction) {
                // 检查是否是本地开发环境
                const isLocalDev =
                    config.debug ||
                    ctx.host.includes('localhost') ||
                    ctx.host.includes('127.0.0.1') ||
                    ctx.host.includes('172.17.0.5') ||
                    /^\d+\.\d+\.\d+\.\d+/.test(ctx.host);

                if (isLocalDev) {
                    // 本地环境：重定向到根路径
                    ctx.redirect('/');
                } else {
                    // 生产环境：重定向到官网
                }
            }
        }

        await next();
    };
}

export default InitMiddleware;
