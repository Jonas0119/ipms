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
}

const PcPurchaseOptionAction = <Action>{
    router: {
        path: '/purchase/option',
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
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const supplier = await ctx.model.from('ejyy_material_supplier').select('id', 'title');

        const material = await ctx.model
            .from('ejyy_material')
            .where('community_id', community_id)
            .select('id', 'name')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                supplier,
                material
            }
        };
    }
};

export default PcPurchaseOptionAction;
