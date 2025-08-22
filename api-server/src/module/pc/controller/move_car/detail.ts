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

const PcMoveCarDetailAction = <Action>{
    router: {
        path: '/move_car/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQNC],
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
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_move_car')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_move_car.wechat_mp_user_id')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_move_car.response_user_id')
            .select(
                'ipms_move_car.id',
                'ipms_move_car.car_number',
                'ipms_move_car.move_reason',
                'ipms_move_car.live_img',
                'ipms_move_car.subscribed',
                'ipms_move_car.have_concat_info',
                'ipms_move_car.response_user_id',
                'ipms_move_car.response_content',
                'ipms_move_car.responsed_at',
                'ipms_move_car.created_at',
                'ipms_wechat_mp_user.real_name as wechat_mp_user_real_name',
                'ipms_wechat_mp_user.id as wechat_mp_user_id',
                'ipms_property_company_user.real_name as property_company_user_real_name',
                'ipms_property_company_user.id as property_company_user_id'
            )
            .where('ipms_move_car.id', id)
            .where('ipms_move_car.community_id', community_id)
            .first();

        let concatList = [];

        if (info.have_concat_info) {
            concatList = await ctx.model
                .from('ipms_user_car')
                .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_user_car.wechat_mp_user_id')
                .where('ipms_user_car.car_number', info.car_number)
                .select('ipms_wechat_mp_user.phone', 'ipms_user_car.car_number');
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                concatList
            }
        };
    }
};

export default PcMoveCarDetailAction;
