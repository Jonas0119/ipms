/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestParams {
    id: number;
}

const PcMaterialCategoryDeleteAction = <Action>{
    router: {
        path: '/material/category_delete/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.WLCC]
    },
    validator: {
        params: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const exist = await ctx.model
            .from('ipms_material_category')
            .where('id', id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法操作'
            });
        }

        const used = await ctx.model
            .from('ipms_material')
            .where('category_id', id)
            .first();

        if (used) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '物品分类使用中，不能删除'
            });
        }

        await ctx.model
            .from('ipms_material_category')
            .where('id', id)
            .delete();

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcMaterialCategoryDeleteAction;
