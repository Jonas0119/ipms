/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import kjhlog from '~/utils/kjhlog';

import path from 'path';
import { Context } from 'koa';
import { Action } from '~/types/action';
import KoaRouter from 'koa-router';
import * as PcModuleRouter from './router';
import config from '~/config';
import validatorService from '~/service/validator';
import { PARAMS_ERROR, ACCESS_DENY, QUERY_ILLEFAL } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';
import * as propertyCompanyService from '~/service/property_company';

/**
 * PC端模块初始化函数
 * 
 * 这个函数的作用是注册PC端的所有路由和中间件处理逻辑
 * 它是PC端模块的核心入口，负责：
 * 1. 遍历所有PC端Action并注册到路由系统
 * 2. 统一处理身份认证和权限验证
 * 3. 统一处理参数验证
 * 4. 确保所有PC端接口的安全性和一致性
 * 
 * @param appRouter - Koa路由实例，用于注册路由
 */
function PcModule(appRouter: KoaRouter) {
    // 遍历PC模块中定义的所有Action
    // 每个Action都包含路由配置、验证规则和响应处理函数
    for (const name in PcModuleRouter) {
        const { router, validator, response } = <Action>PcModuleRouter[name];

        // 注册路由到Koa路由系统
        // 所有PC端接口都统一添加'/pc'前缀，便于区分不同端的API
        appRouter[router.method](path.posix.join('/pc', router.path), async (ctx: Context, next) => {
            // 身份认证处理
            // 如果接口需要登录验证，则进行token校验和用户信息获取
            if (router.authRequired) {
                // 从请求头获取PC端专用的认证token
                // 使用专用的header名称避免与其他端（如MP端）的token冲突
                const token = ctx.request.header['ipms-pc-token'] as string;

                // token不存在直接返回401未授权状态
                if (!token) {
                    return (ctx.status = 401);
                }

                // 根据token查询用户完整信息
                // 使用左连接获取用户基本信息、微信绑定状态、权限配置等
                // 这样设计是为了在一次查询中获取用户的所有相关信息，提高性能
                const pcUserInfo = await ctx.model
                    .table('ipms_property_company_auth')                    // 认证表，存储token信息
                    .leftJoin(
                        'ipms_property_company_user',                       // 用户基本信息表
                        'ipms_property_company_user.id',
                        'ipms_property_company_auth.property_company_user_id'
                    )
                    .leftJoin(
                        'ipms_wechat_official_accounts_user',               // 微信公众号用户表，获取订阅状态
                        'ipms_wechat_official_accounts_user.union_id',
                        'ipms_property_company_user.union_id'
                    )
                    .leftJoin(
                        'ipms_property_company_access',                     // 权限配置表，获取用户角色权限
                        'ipms_property_company_access.id',
                        'ipms_property_company_user.access_id'
                    )
                    .where('ipms_property_company_auth.token', token)       // 根据token查询
                    .where('ipms_property_company_user.leave_office', FALSE) // 排除已离职用户
                    .select(
                        'ipms_property_company_user.id',
                        'ipms_property_company_user.account',
                        'ipms_property_company_user.real_name',
                        'ipms_property_company_user.gender',
                        'ipms_property_company_user.avatar_url',
                        'ipms_property_company_user.phone',
                        'ipms_property_company_user.department_id',
                        'ipms_property_company_user.job_id',
                        'ipms_property_company_user.join_company_at',
                        'ipms_property_company_user.admin',                 // 是否为超级管理员
                        'ipms_property_company_user.created_at',
                        'ipms_wechat_official_accounts_user.subscribed',    // 微信订阅状态
                        'ipms_property_company_access.content'              // 权限配置内容
                    )
                    .first();

                // 用户不存在或token无效，返回401
                if (!pcUserInfo) {
                    return (ctx.status = 401);
                }

                // 处理权限配置数据
                // 将权限配置从查询结果中提取出来，如果为空则设为空数组
                const access = pcUserInfo.content ? pcUserInfo.content : [];
                delete pcUserInfo.content; // 从用户信息中删除权限配置字段

                // 将用户信息和权限配置存储到上下文中，供后续中间件使用
                ctx.pcUserInfo = { ...pcUserInfo, access };

                // 权限验证处理
                // 如果Action定义了特定的角色权限要求，则进行权限校验
                if (Array.isArray(router.roles)) {
                    // 权限验证逻辑：
                    // 1. 超级管理员（admin=true）拥有所有权限，直接通过
                    // 2. 如果权限列表包含ANYONE，表示任何登录用户都可访问
                    // 3. 普通用户需要检查是否拥有要求的权限中的任意一个
                    if (
                        !ctx.pcUserInfo.admin &&                           // 非超级管理员
                        !router.roles.includes(ROLE.ANYONE) &&             // 非公共权限
                        !router.roles.some(role => ctx.pcUserInfo.access.includes(role)) // 不具备所需权限
                    ) {
                        return (ctx.body = {
                            code: ACCESS_DENY,
                            message: '权限不足，无法访问'
                        });
                    }
                }

                // 社区权限验证
                // 某些操作需要验证用户是否有权限操作特定社区的数据
                // 这是为了确保用户只能操作自己负责的社区，防止越权访问
                if (router.verifyCommunity) {
                    const verifyCommunityRes = await propertyCompanyService.verifyCommunity(
                        ctx.model,
                        ctx.pcUserInfo.id,
                        ctx.request.body.community_id
                    );

                    if (!verifyCommunityRes) {
                        return (ctx.body = {
                            code: QUERY_ILLEFAL,
                            message: '操作非法'
                        });
                    }
                }
            }

            // 参数验证处理
            // 使用统一的验证服务对请求参数进行校验
            // 包括body、params、query、files等不同来源的参数
            const vs = validatorService(ctx, validator);

            // 参数验证失败，返回错误信息
            if (!vs.success) {
                return (ctx.body = {
                    code: PARAMS_ERROR,
                    message: vs.message
                });
            }

            // 执行Action的具体业务逻辑
            // 所有前置验证都通过后，调用Action定义的response函数处理业务
            await response.apply(this, [ctx, next]);
        });

        // 开发环境下输出路由注册信息
        // 方便开发者了解系统启动时注册了哪些路由
        if (config.debug) {
            kjhlog.info(`${name} mounted and request from ${path.posix.join('/pc', router.path)} by ${router.method}`);
        }
    }
}

export default PcModule;
