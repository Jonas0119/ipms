/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE } from '~/constant/status';

interface RequestParams {
    id: number;
}

const PcColleagueDetailAction = <Action>{
    router: {
        path: '/colleague/detail/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.ANYONE]
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
                'ipms_wechat_official_accounts_user',
                'ipms_wechat_official_accounts_user.union_id',
                'ipms_property_company_user.union_id'
            )
            .where('ipms_property_company_user.id', id)
            .andWhere('ipms_property_company_user.leave_office', FALSE)
            .select(
                'ipms_property_company_user.id',
                'ipms_property_company_user.real_name',
                'ipms_property_company_user.phone',
                'ipms_property_company_user.gender',
                'ipms_property_company_user.avatar_url',
                'ipms_property_company_user.join_company_at',
                'ipms_property_company_department.name as department',
                'ipms_property_company_job.name as job',
                'ipms_wechat_official_accounts_user.subscribed'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取同事信息'
            });
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                info
            }
        };
    }
};

export default PcColleagueDetailAction;
