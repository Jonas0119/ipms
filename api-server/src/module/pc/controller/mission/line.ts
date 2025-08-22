/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import utils from '~/utils';

interface RequestParams {
    complete_id: number;
}

const PcMissionLineAction = <Action>{
    router: {
        path: '/mission/line/:complete_id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.ANYONE]
    },
    validator: {
        params: [
            {
                name: 'complete_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { complete_id } = <RequestParams>ctx.params;

        const records = await ctx.model
            .from('ipms_mission_complete_node')
            .leftJoin('ipms_mission_point', 'ipms_mission_point.id', 'ipms_mission_complete_node.point_id')
            .where('ipms_mission_complete_node.complete_id', complete_id)
            .select(
                'ipms_mission_complete_node.id',
                'ipms_mission_complete_node.normal',
                'ipms_mission_complete_node.remark',
                'ipms_mission_complete_node.img1',
                'ipms_mission_complete_node.img2',
                'ipms_mission_complete_node.img3',
                'ipms_mission_complete_node.created_at',
                'ipms_mission_point.local'
            );

        const list = [];

        for (const record of records) {
            const imgs = [record.img1];

            if (record.img2) {
                imgs.push(record.img2);
            }

            if (record.img3) {
                imgs.push(record.img3);
            }

            const like = utils.sql.countReader(
                await ctx.model
                    .from('ipms_mission_complete_node')
                    .whereNot('id', record.id)
                    .whereIn('img1', imgs)
                    .orWhereIn('img2', imgs)
                    .orWhereIn('img3', imgs)
                    .count()
            );

            list.push({
                imgs,
                like,
                normal: record.normal,
                remark: record.remark,
                local: record.local,
                created_at: record.created_at
            });
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcMissionLineAction;
