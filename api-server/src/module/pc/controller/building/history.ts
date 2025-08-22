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
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcBuildingHistoryAction = <Action>{
    router: {
        path: '/building/history',
        method: 'post',
        authRequired: true,
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
            .leftJoin('ipms_user_building', 'ipms_user_building.building_id', 'ipms_building_info.id')
            .where('ipms_building_info.community_id', community_id)
            .andWhere('ipms_user_building.id', id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法查询固定资产历史操作'
            });
        }

        const list = await ctx.model
            .from('ipms_user_building_operate_log')
            .leftJoin(
                'ipms_wechat_mp_user',
                'ipms_wechat_mp_user.id',
                'ipms_user_building_operate_log.wechat_mp_user_id'
            )
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_user_building_operate_log.property_company_user_id'
            )
            .where('ipms_user_building_operate_log.user_building_id', id)
            .select(
                'ipms_user_building_operate_log.status',
                'ipms_user_building_operate_log.operate_by',
                'ipms_user_building_operate_log.created_at',
                'ipms_wechat_mp_user.id as ipms_wechat_mp_user_id',
                'ipms_wechat_mp_user.real_name as ipms_wechat_mp_user_real_name',
                'ipms_property_company_user.id as property_company_user_id',
                'ipms_property_company_user.real_name as property_company_user_real_name'
            )
            .orderBy('ipms_user_building_operate_log.id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcBuildingHistoryAction;
