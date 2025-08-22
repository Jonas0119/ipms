/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE, TRUE } from '~/constant/status';
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    property_fee_id: number;
    type: typeof HOUSE | typeof CARPORT | typeof WAREHOUSE | typeof MERCHANT | typeof GARAGE;
}

const PcPaymentUnpayListAction = <Action>{
    router: {
        path: '/payment/unpay_list',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CWGL]
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
                name: 'property_fee_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'type',
                regex: /^1|2|3|4|5$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, property_fee_id, type } = <RequestBody>ctx.request.body;
        const where = {};

        if (type) {
            where['ipms_building_info.type'] = type;
        }

        const list = await ctx.model
            .from('ipms_building_info')
            .where('ipms_building_info.community_id', community_id)
            .andWhere(where)
            .whereNotIn('ipms_building_info.id', function() {
                this.from('ipms_property_fee')
                    .leftJoin(
                        'ipms_property_fee_order',
                        'ipms_property_fee_order.property_fee_id',
                        'ipms_property_fee.id'
                    )
                    .leftJoin(
                        'ipms_property_fee_order_item',
                        'ipms_property_fee_order_item.property_fee_order_id',
                        'ipms_property_fee_order.id'
                    )
                    .where('ipms_property_fee.id', property_fee_id)
                    .andWhere('ipms_property_fee_order.cancel', FALSE)
                    .andWhere('ipms_property_fee_order.paid', TRUE)
                    .andWhere('ipms_property_fee_order_item.refund', FALSE)
                    .whereNull('ipms_property_fee_order_item.refund_apply_at')
                    .select('ipms_property_fee_order_item.building_id');
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_building_info.id'))
            .select(
                'ipms_building_info.id',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_building_info.construction_area',
                'ipms_building_info.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_building_info.id', 'desc');

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

export default PcPaymentUnpayListAction;
