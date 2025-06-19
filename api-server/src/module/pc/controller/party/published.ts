/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, STATUS_ERROR, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE } from '~/constant/status';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcPartyPublishedAction = <Action>{
    router: {
        path: '/party/published',
        method: 'post',
        authRequired: true,
        roles: [ROLE.DJDX],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_party')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取党建党讯'
            });
        }

        if (exist.published === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '党建党讯已发布'
            });
        }

        const published_at = Date.now();
        await ctx.model
            .from('ejyy_party')
            .update({
                published: TRUE,
                published_at,
                published_by: ctx.pcUserInfo.id
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            data: {
                published_at
            }
        };
    }
};

export default PcPartyPublishedAction;
