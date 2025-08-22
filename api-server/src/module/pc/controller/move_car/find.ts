/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { BINDING_CAR } from '~/constant/status';

interface RequestBody {
    car_number: string;
    community_id: number;
}

const PcMoveCarFindAction = <Action>{
    router: {
        path: '/move_car/find',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQNC],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'car_number',
                required: true,
                min: 7,
                max: 8,
                regex: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { car_number } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_user_car')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_user_car.wechat_mp_user_id')
            .where('ipms_user_car.car_number', car_number)
            .andWhere('ipms_user_car.status', BINDING_CAR)
            .select('ipms_wechat_mp_user.phone');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcMoveCarFindAction;
