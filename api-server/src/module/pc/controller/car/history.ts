/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcCarHistoryAction = <Action>{
    router: {
        path: '/car/history',
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

        const list = await ctx.model
            .from('ipms_user_car_operate_log')
            .leftJoin('ipms_user_car', 'ipms_user_car.id', 'ipms_user_car_operate_log.user_car_id')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_car.building_id')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_user_car_operate_log.wechat_mp_user_id')
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_user_car_operate_log.property_company_user_id'
            )
            .where('ipms_user_car_operate_log.user_car_id', id)
            .andWhere('ipms_building_info.community_id', community_id)
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
                list
            }
        };
    }
};

export default PcCarHistoryAction;
