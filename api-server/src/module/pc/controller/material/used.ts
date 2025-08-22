/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    material_id: number;
    page_num: number;
    page_size: number;
}

const PcMaterialUsedction = <Action>{
    router: {
        path: '/material/used',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE]
    },
    validator: {
        body: [
            {
                name: 'material_id',
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
        const { page_num, page_size, material_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_material_used')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_material_used.used_by')
            .where('ipms_material_used.material_id', material_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_material_used.id'))
            .select(
                'ipms_material_used.id',
                'ipms_material_used.total',
                'ipms_material_used.reason',
                'ipms_material_used.created_at',
                'ipms_material_used.used_by',
                'ipms_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_material_used.id', 'desc');

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

export default PcMaterialUsedction;
