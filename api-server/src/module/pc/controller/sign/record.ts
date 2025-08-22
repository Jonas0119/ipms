/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    user_id: number;
    start?: number;
    end?: number;
}

const PcSignRecordAction = <Action>{
    router: {
        path: '/sign/record',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'user_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'start',
                regex: /^\d{13}$/
            },
            {
                name: 'end',
                regex: /^\d{13}$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, user_id, start, end } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_property_company_user')
            .leftJoin(
                'ipms_property_company_department',
                'ipms_property_company_department.id',
                'ipms_property_company_user.department_id'
            )
            .leftJoin('ipms_property_company_job', 'ipms_property_company_job.id', 'ipms_property_company_user.job_id')
            .where('ipms_property_company_user.id', user_id)
            .select(
                'ipms_property_company_user.id',
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
                'ipms_property_company_department.name as department',
                'ipms_property_company_job.name as job'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取考勤信息'
            });
        }

        const list = await ctx.model
            .from('ipms_employee_sign_record')
            .where('community_id', community_id)
            .andWhere('created_by', user_id)
            .andWhere('date', '>=', start ? start : Date.now() - 7000 * 24 * 60 * 60)
            .andWhere('date', '<=', end ? end : Date.now())
            .select(
                'date',
                'begin',
                'begin_lat',
                'begin_lng',
                'begin_accuracy',
                'finish',
                'finish_lat',
                'finish_lng',
                'finish_accuracy'
            )
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                list
            }
        };
    }
};

export default PcSignRecordAction;
