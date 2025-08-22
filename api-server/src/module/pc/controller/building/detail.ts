/**
 * +----------------------------------------------------------------------
 * | IPMS
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2025 IPMS
 * +----------------------------------------------------------------------
 * | IPMS
 * +----------------------------------------------------------------------
 * | Author: support@ipms.local
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { CARPORT, GARAGE } from '~/constant/building';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcBuildingDetailAction = <Action>{
    router: {
        path: '/building/detail',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.FCDA]
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
        const { community_id, id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_building_info')
            .where('community_id', community_id)
            .andWhere('id', id)
            .select('id', 'type', 'area', 'building', 'unit', 'number', 'construction_area', 'created_at')
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的固定资产查询'
            });
        }

        const registered = await ctx.model
            .from('ipms_property_company_building_registered')
            .where('building_id', id)
            .select('name', 'idcard', 'phone')
            .first();

        let owners = [];

        if (ctx.pcUserInfo.access.includes(ROLE.YZDA)) {
            owners = await ctx.model
                .from('ipms_user_building')
                .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_user_building.wechat_mp_user_id')
                .where('ipms_user_building.building_id', id)
                .select(
                    'ipms_user_building.id',
                    'ipms_wechat_mp_user.id as user_id',
                    'ipms_wechat_mp_user.real_name',
                    'ipms_user_building.status'
                );
        }

        let cars = [];

        if (ctx.pcUserInfo.access.includes(ROLE.CLGL) && (info.type === CARPORT || info.type === GARAGE)) {
            cars = await ctx.model
                .from('ipms_user_car')
                .where('building_id', id)
                .select('id', 'car_number', 'car_type', 'status', 'created_at');
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                registered,
                owners,
                cars
            }
        };
    }
};

export default PcBuildingDetailAction;
