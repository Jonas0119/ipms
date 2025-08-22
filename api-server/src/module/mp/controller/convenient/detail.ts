/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';

interface RequestParams {
    community_id: number;
}

const MpConvenientDetailAction = <Action>{
    router: {
        path: '/convenient/detail/:community_id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestParams>ctx.params;

        const list = await ctx.model
            .from('ipms_convenient')
            .where('community_id', community_id)
            .select('title', 'location', 'phone')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default MpConvenientDetailAction;
