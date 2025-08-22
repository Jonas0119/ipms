/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { TRUE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
    building_id: number;
}

const PcCarSyncAction = <Action>{
    router: {
        path: '/car/sync',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CLGL]
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'building_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id, building_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ipms_user_car')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_car.building_id')
            .where('ipms_user_car.id', id)
            .andWhere('ipms_building_info.community_id', community_id)
            .andWhere('ipms_user_car.building_id', building_id)
            .select()
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改车辆同步状态'
            });
        }

        if (detail.sync === TRUE) {
            return (ctx.body = {
                code: SUCCESS,
                message: '车辆同步状态已更新'
            });
        }

        await ctx.model
            .from('ipms_user_car')
            .where('id', id)
            .update('sync', TRUE);

        await ctx.model
            .from('ipms_user_car_sync')
            .where('user_car_id', id)
            .delete();

        ctx.body = {
            code: SUCCESS,
            message: '修改车辆同步状态成功'
        };
    }
};

export default PcCarSyncAction;
