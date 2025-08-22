/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, MATERIAL_CATEGORY_EXIST, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
    name: string;
    local: string;
}

const PcStorehouseUpdateAction = <Action>{
    router: {
        path: '/storehouse/update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WLCC],
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
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'name',
                max: 12,
                required: true
            },
            {
                name: 'local',
                max: 56,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, name, local, community_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ipms_storehouse')
            .where('community_id', community_id)
            .andWhere('id', id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法操作'
            });
        }

        const repeat = await ctx.model
            .from('ipms_storehouse')
            .where('name', name)
            .andWhere('community_id', community_id)
            .andWhereNot('id', id)
            .first();

        if (repeat) {
            return (ctx.body = {
                code: MATERIAL_CATEGORY_EXIST,
                message: '仓库已存在'
            });
        }

        await ctx.model
            .from('ipms_storehouse')
            .update({ name, local })
            .where('id', id)
            .andWhere('community_id', community_id);

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcStorehouseUpdateAction;
