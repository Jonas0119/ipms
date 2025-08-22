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

const PcRefoundDetailAction = <Action>{
    router: {
        path: '/refound/detail',
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
            .from('ipms_refound')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_refound.created_by')
            .leftJoin(
                'ipms_property_company_department',
                'ipms_property_company_department.id',
                'ipms_property_company_user.department_id'
            )
            .where('ipms_refound.id', id)
            .andWhere('ipms_refound.community_id', community_id)
            .select(
                'ipms_refound.id',
                'ipms_refound.created_by',
                'ipms_refound.begin_date',
                'ipms_refound.finish_date',
                'ipms_refound.reason',
                'ipms_refound.total',
                'ipms_refound.step',
                'ipms_refound.success',
                'ipms_refound.cancel',
                'ipms_refound.canceled_at',
                'ipms_refound.created_at',
                'ipms_property_company_user.real_name',
                'ipms_property_company_department.name as department_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取报销详细'
            });
        }

        const steps = await ctx.model
            .from('ipms_refound_flow')
            .leftJoin('ipms_workflow_node', 'ipms_workflow_node.id', 'ipms_refound_flow.workflow_node_id')
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_refound_flow.relation_user_id'
            )
            .where('ipms_refound_flow.parent_id', id)
            .select(
                'ipms_refound_flow.id',
                'ipms_refound_flow.step',
                'ipms_refound_flow.finish',
                'ipms_refound_flow.applicant_assign',
                'ipms_refound_flow.relation_user_id',
                'ipms_refound_flow.refuse_reason',
                'ipms_refound_flow.finished_at',
                'ipms_workflow_node.type',
                'ipms_workflow_node.category',
                'ipms_workflow_node.value',
                'ipms_workflow_node.opt',
                'ipms_workflow_node.opt_first_equal',
                'ipms_workflow_node.opt_second_equal',
                'ipms_property_company_user.real_name as relation_user_name'
            );

        const items = await ctx.model
            .from('ipms_refound_item')
            .where('refound_id', id)
            .select('*');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                steps: steps.map(step => {
                    return {
                        ...step,
                        value: JSON.parse(step.value)
                    };
                }),
                items
            }
        };
    }
};

export default PcRefoundDetailAction;
