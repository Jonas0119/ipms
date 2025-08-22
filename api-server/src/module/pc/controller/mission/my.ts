/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import moment from 'moment';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
}

const PcMissionMyAction = <Action>{
    router: {
        path: '/mission/my',
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

        const records = await ctx.model
            .from('ipms_mission')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_mission.created_by')
            .leftJoin('ipms_mission_category', 'ipms_mission_category.id', 'ipms_mission.category_id')
            .leftJoin('ipms_mission_line', 'ipms_mission_line.id', 'ipms_mission.line_id')
            .where('ipms_mission.community_id', community_id)
            .andWhere('ipms_mission.user_id', ctx.pcUserInfo.id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_mission.id'))
            .select(
                'ipms_mission.id',
                'ipms_mission.start_date',
                'ipms_mission.end_date',
                'ipms_mission.start_hour',
                'ipms_mission.end_hour',
                'ipms_mission.cancel',
                'ipms_mission.created_at',
                'ipms_mission.created_by',
                'ipms_property_company_user.real_name',
                'ipms_mission_category.name as category',
                'ipms_mission_line.name as line'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_mission.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));
        const list = [];
        const date = moment()
            .startOf('day')
            .valueOf();

        for (const record of records) {
            let finish = 0;

            if (record.start_date <= date && date <= record.end_date) {
                const completeInfo = await ctx.model
                    .from('ipms_mission_complete')
                    .where('mission_id', record.id)
                    .andWhere('date', date)
                    .first();

                if (completeInfo) {
                    finish = completeInfo.finish;
                }
            }

            list.push({
                ...record,
                finish
            });
        }

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

export default PcMissionMyAction;
