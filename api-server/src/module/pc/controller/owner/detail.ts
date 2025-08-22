/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcOwerDetailAction = <Action>{
    router: {
        path: '/owner/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YZDA],
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
        const { community_id, id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_wechat_mp_user')
            .leftJoin(
                'ipms_wechat_official_accounts_user',
                'ipms_wechat_official_accounts_user.union_id',
                'ipms_wechat_mp_user.union_id'
            )
            .where('ipms_wechat_mp_user.id', id)
            .select(
                'ipms_wechat_mp_user.id',
                'ipms_wechat_mp_user.nick_name',
                'ipms_wechat_mp_user.real_name',
                'ipms_wechat_mp_user.idcard',
                'ipms_wechat_mp_user.phone',
                'ipms_wechat_mp_user.avatar_url',
                'ipms_wechat_mp_user.signature',
                'ipms_wechat_mp_user.gender',
                'ipms_wechat_mp_user.intact',
                'ipms_wechat_mp_user.created_at',
                'ipms_wechat_official_accounts_user.subscribed'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取用户信息'
            });
        }

        const buildings = await ctx.model
            .from('ipms_building_info')
            .leftJoin('ipms_user_building', 'ipms_user_building.building_id', 'ipms_building_info.id')
            .where('ipms_building_info.community_id', community_id)
            .andWhere('ipms_user_building.wechat_mp_user_id', id)
            .select(
                'ipms_user_building.id',
                'ipms_user_building.building_id',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_building_info.construction_area',
                'ipms_building_info.created_at',
                'ipms_user_building.authenticated',
                'ipms_user_building.authenticated_type',
                'ipms_user_building.status'
            );

        if (buildings.length === 0) {
            const existApply = await ctx.model
                .from('ipms_owner_apply')
                .where('community_id', community_id)
                .andWhere('wechat_mp_user_id', id)
                .andWhere('success', FALSE)
                .first();

            if (!existApply) {
                return (ctx.body = {
                    code: QUERY_ILLEFAL,
                    message: '非法获取用户信息'
                });
            }
        }

        const cars = await ctx.model
            .from('ipms_user_car')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_car.building_id')
            .where('wechat_mp_user_id', id)
            .whereIn(
                'ipms_user_car.building_id',
                buildings.map(record => record.building_id)
            )
            .select(
                'ipms_user_car.id',
                'ipms_user_car.car_number',
                'ipms_user_car.status',
                'ipms_user_car.building_id',
                'ipms_user_car.created_at',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number'
            );

        await ctx.model.from('ipms_owner_detail_log').insert({
            wechat_mp_user_id: id,
            property_company_user_id: ctx.pcUserInfo.id,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                buildings,
                cars
            }
        };
    }
};

export default PcOwerDetailAction;
