/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
}

const PcMeetingDetailAction = <Action>{
    router: {
        path: '/meeting/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
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
            .from('ipms_meeting')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_meeting.created_by')
            .leftJoin('ipms_meeting_room', 'ipms_meeting_room.id', 'ipms_meeting.meeting_room_id')
            .where('ipms_meeting.id', id)
            .andWhere('ipms_meeting.community_id', community_id)
            .select(
                'ipms_meeting.id',
                'ipms_meeting.start_time',
                'ipms_meeting.end_time',
                'ipms_meeting.theme',
                'ipms_meeting.cancel',
                'ipms_meeting.created_by',
                'ipms_meeting.created_at',
                'ipms_property_company_user.real_name',
                'ipms_meeting_room.name',
                'ipms_meeting_room.local',
                'ipms_meeting_room.have_tv',
                'ipms_meeting_room.have_board',
                'ipms_meeting_room.have_projector'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的会议'
            });
        }

        const participant = await ctx.model
            .from('ipms_meeting_participant')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_meeting_participant.user_id')
            .where('ipms_meeting_participant.meeting_id', id)
            .select('ipms_meeting_participant.user_id', 'ipms_property_company_user.real_name');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                participant
            }
        };
    }
};

export default PcMeetingDetailAction;
