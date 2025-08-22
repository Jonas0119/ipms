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

const PcMeetingParticipantAction = <Action>{
    router: {
        path: '/meeting/participant',
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
            .from('ipms_meeting')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_meeting.created_by')
            .leftJoin('ipms_meeting_room', 'ipms_meeting_room.id', 'ipms_meeting.meeting_room_id')
            .where('ipms_meeting.community_id', community_id)
            .whereIn('ipms_meeting.id', function() {
                this.from('ipms_meeting_participant')
                    .where('user_id', ctx.pcUserInfo.id)
                    .select('meeting_id');
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_meeting.id'))
            .select(
                'ipms_meeting.id',
                'ipms_meeting.theme',
                'ipms_meeting.start_time',
                'ipms_meeting.end_time',
                'ipms_meeting.cancel',
                'ipms_meeting.created_at',
                'ipms_meeting.created_by',
                'ipms_property_company_user.real_name',
                'ipms_meeting_room.name',
                'ipms_meeting_room.local'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_meeting.id', 'desc');

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

export default PcMeetingParticipantAction;
