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
    page_num: number;
    page_size: number;
}

const PcMeetingRoomListAction = <Action>{
    router: {
        path: '/meeting_room/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.HYSGL],
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
            .from('ipms_meeting_room')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_meeting_room.created_by')
            .where('ipms_meeting_room.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_meeting_room.id'))
            .select(
                'ipms_meeting_room.id',
                'ipms_meeting_room.name',
                'ipms_meeting_room.local',
                'ipms_meeting_room.have_tv',
                'ipms_meeting_room.have_board',
                'ipms_meeting_room.have_projector',
                'ipms_meeting_room.created_at',
                'ipms_meeting_room.created_by',
                'ipms_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_meeting_room.id', 'desc');

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

export default PcMeetingRoomListAction;
