/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { BINDING_CAR, UNBINDING_CAR } from '~/constant/status';
import { BLUE_PLATE_CAR, YELLOW_PLATE_CAR } from '~/constant/car';
import { TRUE, FALSE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    car_number?: string;
    car_type?: typeof BLUE_PLATE_CAR | typeof YELLOW_PLATE_CAR;
    is_new_energy?: typeof TRUE | typeof FALSE;
    status?: typeof BINDING_CAR | typeof UNBINDING_CAR;
    sync?: typeof TRUE | typeof FALSE;
}

const PcCarListAction = <Action>{
    router: {
        path: '/car/list',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CLGL]
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
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'is_new_energy',
                regex: /^0|1$/
            },
            {
                name: 'car_number',
                min: 7,
                max: 8,
                regex: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/
            },
            {
                name: 'car_type',
                regex: /^1|2$/
            },
            {
                name: 'status',
                regex: /^0|1$/
            },
            {
                name: 'sync',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, is_new_energy, car_number, car_type, status, sync } = <RequestBody>(
            ctx.request.body
        );
        const where = {};

        if (is_new_energy !== undefined) {
            where['ipms_user_car.is_new_energy'] = is_new_energy;
        }

        if (car_number !== undefined) {
            where['ipms_user_car.car_number'] = car_number;
        }

        if (car_type !== undefined) {
            where['ipms_user_car.car_type'] = car_type;
        }

        if (status !== undefined) {
            where['ipms_user_car.status'] = status;
        }

        if (sync !== undefined) {
            where['ipms_user_car.sync'] = sync;
        }

        const list = await ctx.model
            .from('ipms_user_car')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_car.building_id')
            .where('ipms_building_info.community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_user_car.id'))
            .select(
                'ipms_user_car.id',
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
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_user_car.id', 'desc');

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

export default PcCarListAction;
