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

function PcModule(appRouter: KoaRouter) {
    for (const name in PcModuleRouter) {
        const { router, validator, response } = <Action>PcModuleRouter[name];

        appRouter[router.method](path.posix.join('/pc', router.path), async (ctx: Context, next) => {
            if (router.authRequired) {
                const token = ctx.request.header['ipms-pc-token'] as string;

                if (!token) {
                    return (ctx.status = 401);
                }

                const pcUserInfo = await ctx.model
                    .table('ipms_property_company_auth')
                    .leftJoin(
                        'ipms_property_company_user',
                        'ipms_property_company_user.id',
                        'ipms_property_company_auth.property_company_user_id'
                    )
                    .leftJoin(
                        'ipms_wechat_official_accounts_user',
                        'ipms_wechat_official_accounts_user.union_id',
                        'ipms_property_company_user.union_id'
                    )
                    .leftJoin(
                        'ipms_property_company_access',
                        'ipms_property_company_access.id',
                        'ipms_property_company_user.access_id'
                    )
                    .where('ipms_property_company_auth.token', token)
                    .where('ipms_property_company_user.leave_office', FALSE)
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
                        'ipms_property_company_user.admin',
                        'ipms_property_company_user.created_at',
                        'ipms_wechat_official_accounts_user.subscribed',
                        'ipms_property_company_access.content'
                    )
                    .first();

                if (!pcUserInfo) {
                    return (ctx.status = 401);
                }

                const access = pcUserInfo.content ? pcUserInfo.content : [];
                delete pcUserInfo.content;

                ctx.pcUserInfo = { ...pcUserInfo, access };

                // 权限 空数组就是admin才能访问
                if (Array.isArray(router.roles)) {
                    if (
                        !ctx.pcUserInfo.admin &&
                        !router.roles.includes(ROLE.ANYONE) &&
                        !router.roles.some(role => ctx.pcUserInfo.access.includes(role))
                    ) {
                        return (ctx.body = {
                            code: ACCESS_DENY,
                            message: '权限不足，无法访问'
                        });
                    }
                }

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

            const vs = validatorService(ctx, validator);

            if (!vs.success) {
                return (ctx.body = {
                    code: PARAMS_ERROR,
                    message: vs.message
                });
            }

            await response.apply(this, [ctx, next]);
        });

        if (config.debug) {
            kjhlog.info(`${name} mounted and request from ${path.posix.join('/pc', router.path)} by ${router.method}`);
        }
    }
}

export default PcModule;
