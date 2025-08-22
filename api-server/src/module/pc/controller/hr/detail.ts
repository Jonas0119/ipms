/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestParams {
    id: number;
}

const PcHrDetailAction = <Action>{
    router: {
        path: '/hr/detail/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    validator: {
        params: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const info = await ctx.model
            .from('ipms_property_company_user')
            .leftJoin(
                'ipms_property_company_department',
                'ipms_property_company_department.id',
                'ipms_property_company_user.department_id'
            )
            .leftJoin('ipms_property_company_job', 'ipms_property_company_job.id', 'ipms_property_company_user.job_id')
            .leftJoin(
                'ipms_property_company_access',
                'ipms_property_company_access.id',
                'ipms_property_company_user.access_id'
            )
            .leftJoin(
                'ipms_wechat_official_accounts_user',
                'ipms_wechat_official_accounts_user.union_id',
                'ipms_property_company_user.union_id'
            )
            .where('ipms_property_company_user.id', id)
            .select(
                'ipms_property_company_user.id',
                'ipms_property_company_user.account',
                'ipms_property_company_user.real_name',
                'ipms_property_company_user.idcard',
                'ipms_property_company_user.phone',
                'ipms_property_company_user.gender',
                'ipms_property_company_user.avatar_url',
                'ipms_property_company_user.join_company_at',
                'ipms_property_company_user.leave_office',
                'ipms_property_company_user.department_id',
                'ipms_property_company_user.job_id',
                'ipms_property_company_user.leave_office',
                'ipms_property_company_user.access_id',
                'ipms_property_company_user.created_by',
                'ipms_property_company_user.created_at',
                'ipms_property_company_department.name as department',
                'ipms_property_company_job.name as job',
                'ipms_wechat_official_accounts_user.subscribed',
                'ipms_property_company_access.name as access_name',
                'ipms_property_company_access.content'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取人事信息'
            });
        }

        let createInfo = null;

        if (info.created_by) {
            createInfo = await ctx.model
                .from('ipms_property_company_user')
                .where('id', info.created_by)
                .select('id', 'real_name')
                .first();
        }

        delete info.created_by;

        const communityList = await ctx.model
            .from('ipms_property_company_user_access_community')
            .leftJoin(
                'ipms_community_info',
                'ipms_community_info.id',
                'ipms_property_company_user_access_community.community_id'
            )
            .where('ipms_property_company_user_access_community.property_company_user_id', id)
            .select('ipms_community_info.name', 'ipms_property_company_user_access_community.community_id');

        const joinRecord = await ctx.model
            .from('ipms_property_company_user_join_record')
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_property_company_user_join_record.created_by'
            )
            .where('ipms_property_company_user_join_record.property_company_user_id', id)
            .select(
                'ipms_property_company_user.id as operated_user_id',
                'ipms_property_company_user.real_name',
                'ipms_property_company_user_join_record.status',
                'ipms_property_company_user_join_record.created_at'
            )
            .orderBy('ipms_property_company_user_join_record.id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                joinRecord,
                createInfo,
                communityList
            }
        };
    }
};

export default PcHrDetailAction;
