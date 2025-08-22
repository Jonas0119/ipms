/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    page_num: number;
    page_size: number;
}

const PcContractListAction = <Action>{
    router: {
        path: '/contract/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.HTGL],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_contract')
            .leftJoin('ipms_contract_category', 'ipms_contract_category.id', 'ipms_contract.category_id')
            .where('ipms_contract.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_contract.id'))
            .select(
                'ipms_contract.id',
                'ipms_contract.title',
                'ipms_contract.contract_fee',
                'ipms_contract.begin_time',
                'ipms_contract.finish_time',
                'ipms_contract.created_at',
                'ipms_contract.created_by',
                'ipms_contract_category.name as category'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_contract.id', 'desc');

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

export default PcContractListAction;
