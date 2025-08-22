/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import utils from '~/utils';
import * as ROLE from '~/constant/role_access';
import { FINISH_REPAIR_STEP } from '~/constant/repair';
import { FINISH_COMPLAIN_STEP } from '~/constant/complain';
import { TRUE, FALSE } from '~/constant/status';
import { WORKFLOW_NODE_APPROVER } from '~/constant/workflow';
import moment from 'moment';

interface RequestBody {
    community_id: number;
}

const StatisticWorkAction = <Action>{
    router: {
        path: '/statistic/work',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.ANYONE]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const now = Date.now();

        const repair_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_repair')
                .where('community_id', community_id)
                .whereNull('merge_id')
                .andWhere('dispose_user_id', ctx.pcUserInfo.id)
                .andWhere('step', '<>', FINISH_REPAIR_STEP)
                .count()
        );

        const complain_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_complain')
                .where('community_id', community_id)
                .whereNull('merge_id')
                .andWhere('dispose_user_id', ctx.pcUserInfo.id)
                .andWhere('step', '<>', FINISH_COMPLAIN_STEP)
                .count()
        );

        const mission_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_mission')
                .where('community_id', community_id)
                .andWhere('user_id', ctx.pcUserInfo.id)
                .andWhere('start_date', '<=', now)
                .andWhere('end_date', '>=', now)
                .andWhere('cancel', FALSE)
                .whereNotIn('id', function() {
                    this.from('ipms_mission_complete')
                        .where('created_by', ctx.pcUserInfo.id)
                        .andWhere('finish', TRUE)
                        .andWhere(
                            'date',
                            moment()
                                .startOf('day')
                                .valueOf()
                        )
                        .select('mission_id');
                })
                .count()
        );

        const leave_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_ask_for_leave_flow')
                .leftJoin('ipms_ask_for_leave', 'ipms_ask_for_leave.id', 'ipms_ask_for_leave_flow.parent_id')
                .where('ipms_ask_for_leave.community_id', community_id)
                .whereNull('ipms_ask_for_leave.success')
                .andWhere('ipms_ask_for_leave.cancel', FALSE)
                .andWhere('ipms_ask_for_leave_flow.node_type', WORKFLOW_NODE_APPROVER)
                .andWhere('ipms_ask_for_leave_flow.relation_user_id', ctx.pcUserInfo.id)
                .andWhere('ipms_ask_for_leave_flow.finish', FALSE)
                .count()
        );

        const refound_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_refound_flow')
                .leftJoin('ipms_refound', 'ipms_refound.id', 'ipms_refound_flow.parent_id')
                .where('ipms_refound.community_id', community_id)
                .whereNull('ipms_refound.success')
                .andWhere('ipms_refound.cancel', FALSE)
                .andWhere('ipms_refound_flow.node_type', WORKFLOW_NODE_APPROVER)
                .andWhere('ipms_refound_flow.relation_user_id', ctx.pcUserInfo.id)
                .andWhere('ipms_refound_flow.finish', FALSE)
                .count()
        );

        const purchase_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_material_purchase_flow')
                .leftJoin(
                    'ipms_material_purchase',
                    'ipms_material_purchase.id',
                    'ipms_material_purchase_flow.parent_id'
                )
                .where('ipms_material_purchase.community_id', community_id)
                .whereNull('ipms_material_purchase.success')
                .andWhere('ipms_material_purchase.cancel', FALSE)
                .andWhere('ipms_material_purchase_flow.node_type', WORKFLOW_NODE_APPROVER)
                .andWhere('ipms_material_purchase_flow.relation_user_id', ctx.pcUserInfo.id)
                .andWhere('ipms_material_purchase_flow.finish', FALSE)
                .count()
        );

        const meeting = await ctx.model
            .from('ipms_meeting')
            .leftJoin('ipms_meeting_room', 'ipms_meeting_room.id', 'ipms_meeting.meeting_room_id')
            .where('ipms_meeting.community_id', community_id)
            .andWhere(
                'ipms_meeting.start_time',
                '>=',
                moment()
                    .startOf('day')
                    .valueOf()
            )
            .andWhere(
                'ipms_meeting.start_time',
                '<=',
                moment()
                    .endOf('day')
                    .valueOf()
            )
            .andWhere(function() {
                this.where('ipms_meeting.created_by', ctx.pcUserInfo.id).orWhereIn('ipms_meeting.id', function() {
                    this.from('ipms_meeting_participant')
                        .where('user_id', ctx.pcUserInfo.id)
                        .select('meeting_id');
                });
            })
            .select(
                'ipms_meeting.id',
                'ipms_meeting.start_time',
                'ipms_meeting.end_time',
                'ipms_meeting_room.name',
                'ipms_meeting_room.local'
            );

        const party = await ctx.model
            .from('ipms_party')
            .andWhere('carousel', TRUE)
            .select('id', 'title', 'cover_img');

        const inform = await ctx.model
            .from('ipms_inform')
            .andWhere('carousel', TRUE)
            .select('id', 'title', 'cover_img');

        const login = await ctx.model
            .from('ipms_property_company_user_login')
            .where('property_company_user_id', ctx.pcUserInfo.id)
            .select('ip', 'user_agent', 'login_at')
            .limit(10)
            .offset(0)
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                repair_total,
                complain_total,
                mission_total,
                leave_total,
                refound_total,
                purchase_total,
                meeting,
                party,
                inform,
                login
            }
        };
    }
};

export default StatisticWorkAction;
