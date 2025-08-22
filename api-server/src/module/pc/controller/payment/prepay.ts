/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { BINDING_BUILDING, FALSE, TRUE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';
import config from '~/config';

interface RequestBody {
    community_id: number;
    property_fee_id: number;
    user_id: number;
}

const PcPaymentPrepayAction = <Action>{
    router: {
        path: '/payment/prepay',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.CWGL]
    },
    validator: {
        body: [
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
                name: 'user_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { user_id, community_id, property_fee_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_user_building')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
            .where('ipms_building_info.community_id', community_id)
            .andWhere('ipms_user_building.status', BINDING_BUILDING)
            .andWhere('ipms_user_building.wechat_mp_user_id', user_id)
            .whereNotIn('ipms_user_building.building_id', function() {
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
                    .andWhere('ipms_property_fee.community_id', community_id)
                    .andWhere('ipms_property_fee_order.cancel', FALSE)
                    .andWhere(function() {
                        this.where(function() {
                            this.where('ipms_property_fee_order.paid', TRUE)
                                .andWhere('ipms_property_fee_order_item.refund', FALSE)
                                .whereNull('ipms_property_fee_order_item.refund_apply_at');
                        }).orWhere(function() {
                            this.where('ipms_property_fee_order.paid', FALSE).andWhere(
                                'ipms_property_fee_order.created_at',
                                '>=',
                                Date.now() - config.wechat.pay.payExpire
                            );
                        });
                    })
                    .select('ipms_property_fee_order_item.building_id');
            })
            .select(
                'ipms_building_info.community_id',
                'ipms_building_info.id as building_id',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_building_info.construction_area'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcPaymentPrepayAction;
