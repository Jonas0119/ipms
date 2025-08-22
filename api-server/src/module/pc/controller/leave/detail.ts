/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcLeaveDetailAction = <Action>{
    router: {
        path: '/leave/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_ask_for_leave')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_ask_for_leave.created_by')
            .leftJoin(
                'ipms_property_company_department',
                'ipms_property_company_department.id',
                'ipms_property_company_user.department_id'
            )
            .where('ipms_ask_for_leave.id', id)
            .andWhere('ipms_ask_for_leave.community_id', community_id)
            .select(
                'ipms_ask_for_leave.id',
                'ipms_ask_for_leave.created_by',
                'ipms_ask_for_leave.begin_date',
                'ipms_ask_for_leave.reason',
                'ipms_ask_for_leave.total',
                'ipms_ask_for_leave.step',
                'ipms_ask_for_leave.success',
                'ipms_ask_for_leave.cancel',
                'ipms_ask_for_leave.canceled_at',
                'ipms_ask_for_leave.created_at',
                'ipms_property_company_user.real_name',
                'ipms_property_company_department.name as department_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取请假详细'
            });
        }

        const steps = await ctx.model
            .from('ipms_ask_for_leave_flow')
            .leftJoin('ipms_workflow_node', 'ipms_workflow_node.id', 'ipms_ask_for_leave_flow.workflow_node_id')
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_ask_for_leave_flow.relation_user_id'
            )
            .where('ipms_ask_for_leave_flow.parent_id', id)
            .select(
                'ipms_ask_for_leave_flow.id',
                'ipms_ask_for_leave_flow.step',
                'ipms_ask_for_leave_flow.finish',
                'ipms_ask_for_leave_flow.applicant_assign',
                'ipms_ask_for_leave_flow.relation_user_id',
                'ipms_ask_for_leave_flow.refuse_reason',
                'ipms_ask_for_leave_flow.finished_at',
                'ipms_workflow_node.type',
                'ipms_workflow_node.category',
                'ipms_workflow_node.value',
                'ipms_workflow_node.opt',
                'ipms_workflow_node.opt_first_equal',
                'ipms_workflow_node.opt_second_equal',
                'ipms_property_company_user.real_name as relation_user_name'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                steps: steps.map(step => {
                    return {
                        ...step,
                        value: JSON.parse(step.value)
                    };
                })
            }
        };
    }
};

export default PcLeaveDetailAction;
