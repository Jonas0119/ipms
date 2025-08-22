/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE, TRUE } from '~/constant/status';
import { WORKFLOW_NODE_NOTICE } from '~/constant/workflow';

interface RequestBody {
    page_num: number;
    page_size: number;
    success?: typeof FALSE | typeof TRUE;
    community_id: number;
}

const PcPurchaseNoticeAction = <Action>{
    router: {
        path: '/purchase/notice',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'success',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, success } = <RequestBody>ctx.request.body;
        const where = {};

        if (success !== undefined) {
            where['success'] = success;
        }

        const list = await ctx.model
            .from('ipms_material_purchase')
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_material_purchase.created_by'
            )
            .andWhere('ipms_material_purchase.community_id', community_id)
            .andWhere(where)
            .whereIn('ipms_material_purchase.id', function() {
                this.from('ipms_material_purchase_flow')
                    .where('node_type', WORKFLOW_NODE_NOTICE)
                    .andWhere('relation_user_id', ctx.pcUserInfo.id)
                    .select('parent_id');
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_material_purchase.id'))
            .select(
                'ipms_material_purchase.id',
                'ipms_material_purchase.created_by',
                'ipms_property_company_user.real_name',
                'ipms_material_purchase.remark',
                'ipms_material_purchase.total',
                'ipms_material_purchase.success',
                'ipms_material_purchase.cancel',
                'ipms_material_purchase.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_material_purchase.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcPurchaseNoticeAction;
