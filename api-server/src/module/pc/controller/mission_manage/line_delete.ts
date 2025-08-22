/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcMissionManageLineDeleteAction = <Action>{
    router: {
        path: '/mission_manage/line_delete',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XJRW],
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
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_mission_line')
            .where('community_id', community_id)
            .andWhere('id', id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法删除巡检路线'
            });
        }

        const using = await ctx.model
            .from('ipms_mission')
            .where('line_id', id)
            .first();

        if (using) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '巡检路线使用中，无法删除'
            });
        }

        await ctx.model
            .from('ipms_mission_line')
            .where('id', id)
            .delete();

        ctx.body = {
            code: SUCCESS,
            message: '删除巡检路线成功'
        };
    }
};

export default PcMissionManageLineDeleteAction;
