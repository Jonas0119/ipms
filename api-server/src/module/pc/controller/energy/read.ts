/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    page_num: number;
    page_size: number;
    building_id?: number;
}

const PcEnergyReadAction = <Action>{
    router: {
        path: '/energy/read',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
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
                name: 'building_id',
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, building_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_iot_meter')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_iot_meter.created_by')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_iot_meter.building_id')
            .leftJoin('ipms_iot_meter_repeater', 'ipms_iot_meter_repeater.id', 'ipms_iot_meter.repeater_id')
            .where('ipms_iot_meter.community_id', community_id)
            .andWhere(function() {
                if (building_id) {
                    this.where('ipms_iot_meter.building_id', building_id);
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_iot_meter.id'))
            .select(
                'ipms_iot_meter.id',
                'ipms_iot_meter.community_id',
                'ipms_iot_meter.category',
                'ipms_iot_meter.name',
                'ipms_iot_meter.model',
                'ipms_iot_meter.building_id',
                'ipms_iot_meter.no',
                'ipms_iot_meter.imei',
                'ipms_iot_meter.init_value',
                'ipms_iot_meter.current_value',
                'ipms_iot_meter.max_value',
                'ipms_iot_meter.online',
                'ipms_iot_meter.created_by',
                'ipms_iot_meter.created_at',
                'ipms_property_company_user.real_name',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_iot_meter_repeater.name as repeater'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_iot_meter.id', 'desc');

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

export default PcEnergyReadAction;
