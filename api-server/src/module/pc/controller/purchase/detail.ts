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

const PcPurchaseDetailAction = <Action>{
    router: {
        path: '/purchase/detail',
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
            .from('ipms_material_purchase')
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_material_purchase.created_by'
            )
            .leftJoin(
                'ipms_property_company_department',
                'ipms_property_company_department.id',
                'ipms_property_company_user.department_id'
            )
            .where('ipms_material_purchase.id', id)
            .andWhere('ipms_material_purchase.community_id', community_id)
            .select(
                'ipms_material_purchase.id',
                'ipms_material_purchase.created_by',
                'ipms_material_purchase.remark',
                'ipms_material_purchase.total',
                'ipms_material_purchase.step',
                'ipms_material_purchase.success',
                'ipms_material_purchase.cancel',
                'ipms_material_purchase.canceled_at',
                'ipms_material_purchase.created_at',
                'ipms_property_company_user.real_name',
                'ipms_property_company_department.name as department_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取采购详细'
            });
        }

        const steps = await ctx.model
            .from('ipms_material_purchase_flow')
            .leftJoin('ipms_workflow_node', 'ipms_workflow_node.id', 'ipms_material_purchase_flow.workflow_node_id')
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_material_purchase_flow.relation_user_id'
            )
            .where('ipms_material_purchase_flow.parent_id', id)
            .select(
                'ipms_material_purchase_flow.id',
                'ipms_material_purchase_flow.step',
                'ipms_material_purchase_flow.finish',
                'ipms_material_purchase_flow.applicant_assign',
                'ipms_material_purchase_flow.relation_user_id',
                'ipms_material_purchase_flow.refuse_reason',
                'ipms_material_purchase_flow.finished_at',
                'ipms_workflow_node.type',
                'ipms_workflow_node.category',
                'ipms_workflow_node.value',
                'ipms_workflow_node.opt',
                'ipms_workflow_node.opt_first_equal',
                'ipms_workflow_node.opt_second_equal',
                'ipms_property_company_user.real_name as relation_user_name'
            );

        const items = await ctx.model
            .from('ipms_material_purchase_item')
            .leftJoin('ipms_material', 'ipms_material.id', 'ipms_material_purchase_item.material_id')
            .leftJoin('ipms_material_supplier', 'ipms_material_supplier.id', 'ipms_material_purchase_item.supplier_id')
            .where('ipms_material_purchase_item.task_id', id)
            .select(
                'ipms_material_purchase_item.total',
                'ipms_material_purchase_item.fee',
                'ipms_material_purchase_item.material_id',
                'ipms_material_purchase_item.supplier_id',
                'ipms_material_purchase_item.finish',
                'ipms_material.name as material',
                'ipms_material_supplier.title as supplier',
                'ipms_material_supplier.linkman',
                'ipms_material_supplier.phone',
                'ipms_material_supplier.bank_name',
                'ipms_material_supplier.bank_id',
                'ipms_material_supplier.bank_address'
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
                }),
                items
            }
        };
    }
};

export default PcPurchaseDetailAction;
