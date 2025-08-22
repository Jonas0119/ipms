/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcMissionDetailAction = <Action>{
    router: {
        path: '/mission/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_mission')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_mission.user_id')
            .leftJoin('ipms_mission_category', 'ipms_mission_category.id', 'ipms_mission.category_id')
            .leftJoin('ipms_mission_line', 'ipms_mission_line.id', 'ipms_mission.line_id')
            .where('ipms_mission.community_id', community_id)
            .andWhere('ipms_mission.id', id)
            .select(
                'ipms_mission.id',
                'ipms_mission.start_date',
                'ipms_mission.end_date',
                'ipms_mission.start_hour',
                'ipms_mission.end_hour',
                'ipms_mission.cancel',
                'ipms_mission.canceled_at',
                'ipms_mission.created_at',
                'ipms_mission.created_by',
                'ipms_mission.user_id',
                'ipms_property_company_user.real_name',
                'ipms_mission_category.name as category',
                'ipms_mission_line.name as line'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取巡检任务'
            });
        }

        const disposeInfo = await ctx.model
            .from('ipms_property_company_user')
            .where('id', info.created_by)
            .select('id', 'real_name')
            .first();

        const complete = await ctx.model
            .from('ipms_mission_complete')
            .where('mission_id', id)
            .select('id', 'finish', 'point_id', 'date', 'created_at');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                disposeInfo,
                complete
            }
        };
    }
};

export default PcMissionDetailAction;
