/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcCarDetailAction = <Action>{
    router: {
        path: '/car/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.CLGL],
        verifyCommunity: true
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
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_user_car')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_car.building_id')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_user_car.wechat_mp_user_id')
            .where('ipms_building_info.community_id', community_id)
            .where('ipms_user_car.id', id)
            .select(
                'ipms_user_car.id',
                'ipms_user_car.wechat_mp_user_id',
                'ipms_wechat_mp_user.real_name',
                'ipms_user_car.building_id',
                'ipms_user_car.car_number',
                'ipms_user_car.car_type',
                'ipms_user_car.is_new_energy',
                'ipms_user_car.status',
                'ipms_user_car.sync',
                'ipms_user_car.created_at',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取车辆信息'
            });
        }

        const operateList = await ctx.model
            .from('ipms_user_car_operate_log')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_user_car_operate_log.wechat_mp_user_id')
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_user_car_operate_log.property_company_user_id'
            )
            .where('ipms_user_car_operate_log.user_car_id', id)
            .select(
                'ipms_user_car_operate_log.status',
                'ipms_user_car_operate_log.operate_by',
                'ipms_user_car_operate_log.created_at',
                'ipms_wechat_mp_user.id as ipms_wechat_mp_user_id',
                'ipms_wechat_mp_user.real_name as ipms_wechat_mp_user_real_name',
                'ipms_property_company_user.id as property_company_user_id',
                'ipms_property_company_user.real_name as property_company_user_real_name'
            )
            .orderBy('ipms_user_car_operate_log.id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                operateList
            }
        };
    }
};

export default PcCarDetailAction;
