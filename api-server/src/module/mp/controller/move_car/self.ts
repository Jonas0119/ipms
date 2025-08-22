/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { BINDING_CAR } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpMoveCarSelfAction = <Action>{
    router: {
        path: '/move_car/self',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
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
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const myCars = await ctx.model
            .from('ipms_user_car')
            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
            .where('status', BINDING_CAR)
            .select('car_number');

        const list = await ctx.model
            .from('ipms_move_car')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_move_car.community_id')
            .where(function() {
                myCars.forEach(({ car_number }) => {
                    this.orWhere('ipms_move_car.car_number', car_number);
                });
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_move_car.id'))
            .select(
                'ipms_community_info.name as community_name',
                'ipms_move_car.car_number',
                'ipms_move_car.move_reason',
                'ipms_move_car.responsed_at',
                'ipms_move_car.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_move_car.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

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

export default MpMoveCarSelfAction;
