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
    category_id?: number;
    storehouse_id?: number;
}

const PcMaterialListAction = <Action>{
    router: {
        path: '/material/list',
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
            },
            {
                name: 'category_id',
                regex: /^\d+$/
            },
            {
                name: 'storehouse_id',
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, storehouse_id, category_id, community_id } = <RequestBody>ctx.request.body;
        const where = {};

        if (storehouse_id) {
            where['ipms_material.storehouse_id'] = storehouse_id;
        }

        if (category_id) {
            where['ipms_material.category_id'] = category_id;
        }

        const list = await ctx.model
            .from('ipms_material')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_material.created_by')
            .leftJoin('ipms_material_category', 'ipms_material_category.id', 'ipms_material.category_id')
            .leftJoin('ipms_storehouse', 'ipms_storehouse.id', 'ipms_material.storehouse_id')
            .where('ipms_material.community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_material.id'))
            .select(
                'ipms_material.id',
                'ipms_material.name',
                'ipms_material.total',
                'ipms_material.category_id',
                'ipms_material.storehouse_id',
                'ipms_material.created_at',
                'ipms_material.created_by',
                'ipms_property_company_user.real_name',
                'ipms_material_category.name as category',
                'ipms_storehouse.name as storehouse',
                'ipms_storehouse.local'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_material.id', 'desc');

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

export default PcMaterialListAction;
