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

const PcMissionManageLineDetailAction = <Action>{
    router: {
        path: '/mission_manage/line_detail',
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
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_mission_line.created_by')
            .leftJoin('ipms_mission_category', 'ipms_mission_category.id', 'ipms_mission_line.category_id')
            .where('ipms_mission_line.community_id', community_id)
            .andWhere('ipms_mission_line.id', id)
            .select(
                'ipms_mission_line.id',
                'ipms_mission_line.name',
                'ipms_mission_line.description',
                'ipms_mission_line.category_id',
                'ipms_mission_line.created_at',
                'ipms_mission_line.created_by',
                'ipms_property_company_user.real_name',
                'ipms_mission_category.name as category'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法查询巡检路线'
            });
        }

        const points = await ctx.model
            .from('ipms_mission_line_node')
            .leftJoin('ipms_mission_point', 'ipms_mission_point.id', 'ipms_mission_line_node.point_id')
            .where('ipms_mission_line_node.line_id', id)
            .select('ipms_mission_point.id', 'ipms_mission_point.local');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                points
            }
        };
    }
};

export default PcMissionManageLineDetailAction;
