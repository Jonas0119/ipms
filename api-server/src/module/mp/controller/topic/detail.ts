/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';

interface RequestParams {
    id: number;
}

const MpTopicDetailAction = <Action>{
    router: {
        path: '/topic/detail/:id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const detail = await ctx.model
            .from('ejyy_topic')
            .where('id', id)
            .select('title', 'banner_img', 'content', 'created_at')
            .first();

        ctx.body = {
            code: SUCCESS,
            data: detail
        };
    }
};

export default MpTopicDetailAction;
