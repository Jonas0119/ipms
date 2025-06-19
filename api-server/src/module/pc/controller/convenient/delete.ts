/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';

interface RequestBody {
    community_id: number;
    id: number;
}

const PcConvenientDeleteAction = <Action>{
    router: {
        path: '/convenient/delete',
        method: 'post',
        authRequired: true,
        roles: []
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, id } = <RequestBody>ctx.request.body;

        await ctx.model
            .from('ejyy_convenient')
            .where({
                community_id,
                id
            })
            .delete();

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcConvenientDeleteAction;
