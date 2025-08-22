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

const PcMaterialOptionAction = <Action>{
    router: {
        path: '/material/option',
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

        const category = await ctx.model.from('ipms_material_category').select('id', 'name', 'description');

        const storehouse = await ctx.model
            .from('ipms_storehouse')
            .where('community_id', community_id)
            .select('id', 'name', 'local');

        ctx.body = {
            code: SUCCESS,
            data: {
                storehouse,
                category
            }
        };
    }
};

export default PcMaterialOptionAction;
