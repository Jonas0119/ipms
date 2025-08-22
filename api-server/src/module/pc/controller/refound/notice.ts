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

const PcRefoundNoticeAction = <Action>{
    router: {
        path: '/refound/notice',
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
            .from('ipms_refound')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_refound.created_by')
            .andWhere('ipms_refound.community_id', community_id)
            .andWhere(where)
            .whereIn('ipms_refound.id', function() {
                this.from('ipms_refound_flow')
                    .where('node_type', WORKFLOW_NODE_NOTICE)
                    .andWhere('relation_user_id', ctx.pcUserInfo.id)
                    .select('parent_id');
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_refound.id'))
            .select(
                'ipms_refound.id',
                'ipms_refound.created_by',
                'ipms_property_company_user.real_name',
                'ipms_refound.begin_date',
                'ipms_refound.finish_date',
                'ipms_refound.reason',
                'ipms_refound.total',
                'ipms_refound.success',
                'ipms_refound.cancel',
                'ipms_refound.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_refound.id', 'desc');

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

export default PcRefoundNoticeAction;
