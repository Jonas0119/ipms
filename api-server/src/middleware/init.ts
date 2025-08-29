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

/**
 * 系统初始化检查中间件
 * 
 * 主要功能：
 * 1. 检查系统是否已初始化（是否存在管理员用户）
 * 2. 对未初始化的系统进行访问控制
 * 3. 处理初始化相关路由的访问逻辑
 * 
 * 访问控制逻辑：
 * - 系统未初始化时，只允许访问初始化接口和存储相关接口
 * - 系统已初始化时，禁止再次访问初始化接口（防止重复初始化）
 * - 在本地开发环境下，允许重新初始化
 * 
 * @returns Koa中间件函数
 */
function InitMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx: DefaultContext, next) => {
        // 检查当前请求是否为初始化相关的接口
        // 匹配路径格式：/pc/init/xxx
        const isInitAction = /^\/pc\/init\/\w+$/.test(ctx.request.path);

        // 如果系统未初始化，且不是允许的特殊接口（上传和存储相关接口）
        if (!config.inited && !/^\/pc\/(upload\/(sign|local)|storage\/(config|upload))$/.test(ctx.request.path)) {
            // 查询数据库中是否存在管理员用户
            // 通过统计 ipms_property_company_user 表中 admin 字段为 TRUE 的记录数量
            const total = utils.sql.countReader(
                await ctx.model
                    .from('ipms_property_company_user')
                    .where('admin', TRUE)
                    .count()
            );

            // 如果没有管理员用户，说明系统确实未初始化
            if (total === 0) {
                // 如果不是初始化接口，则返回系统未初始化错误
                if (!isInitAction) {
                    return (ctx.body = {
                        code: SYSTEMT_NOT_INIT,
                        message: '系统未初始化'
                    });
                }
                // 如果是初始化接口，则允许继续执行
            } else {
                // 如果存在管理员用户，更新配置状态为已初始化
                config.inited = true;
            }
        } else {
            // 系统已初始化的情况下，处理初始化接口的访问
            if (isInitAction) {
                // 检查是否是本地开发环境
                // 判断条件包括：调试模式、本地主机名、内网IP等
                const isLocalDev =
                    config.debug ||                              // 调试模式
                    ctx.host.includes('localhost') ||            // localhost域名
                    ctx.host.includes('127.0.0.1') ||           // 本地回环地址
                    /^\d+\.\d+\.\d+\.\d+/.test(ctx.host);       // 任意IP地址格式

                if (isLocalDev) {
                    // 本地环境：重定向到根路径，允许重新初始化
                    ctx.redirect('/');
                } else {
                    // 生产环境：重定向到官网，禁止重新初始化
                    // 注：这里的重定向目标需要根据实际需求填写
                }
            }
        }

        // 继续执行下一个中间件
        await next();
    };
}

export default InitMiddleware;
