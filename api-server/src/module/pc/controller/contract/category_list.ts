/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const PcContractCategoryListAction = <Action>{
    router: {
        path: '/contract/category_list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.HTGL]
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
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_contract_category')
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_contract_category.created_by'
            )
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_contract_category.id'))
            .select(
                'ipms_contract_category.id',
                'ipms_contract_category.name',
                'ipms_contract_category.description',
                'ipms_contract_category.created_at',
                'ipms_contract_category.created_by',
                'ipms_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_contract_category.id', 'desc');

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

export default PcContractCategoryListAction;
