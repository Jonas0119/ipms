/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE } from '~/constant/status';

interface RequestBody {
    community_id: number;
}

const PcOptionColleagueAction = <Action>{
    router: {
        path: '/option/colleague',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_property_company_user')
            .leftJoin(
                'ipms_property_company_department',
                'ipms_property_company_department.id',
                'ipms_property_company_user.department_id'
            )
            .leftJoin('ipms_property_company_job', 'ipms_property_company_job.id', 'ipms_property_company_user.job_id')
            .whereIn('ipms_property_company_user.id', function() {
                this.from('ipms_property_company_user_access_community')
                    .where('community_id', community_id)
                    .select('property_company_user_id');
            })
            .andWhere('ipms_property_company_user.leave_office', FALSE)
            .select(
                'ipms_property_company_department.name as department',
                'ipms_property_company_user.department_id',
                'ipms_property_company_job.name as job',
                'ipms_property_company_user.job_id',
                'ipms_property_company_user.real_name',
                'ipms_property_company_user.id'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcOptionColleagueAction;
