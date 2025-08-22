/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
}

const PcMissionManagePointListAction = <Action>{
    router: {
        path: '/mission_manage/point_list',
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
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_mission_point')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_mission_point.created_by')
            .leftJoin('ipms_mission_category', 'ipms_mission_category.id', 'ipms_mission_point.category_id')
            .where('ipms_mission_point.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_mission_point.id'))
            .select(
                'ipms_mission_point.id',
                'ipms_mission_point.local',
                'ipms_mission_point.category_id',
                'ipms_mission_point.created_at',
                'ipms_mission_point.created_by',
                'ipms_property_company_user.real_name',
                'ipms_mission_category.name as category'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_mission_point.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcMissionManagePointListAction;
