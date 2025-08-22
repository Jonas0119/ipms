/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import config from '~/config';
import { FALSE, TRUE, BINDING_BUILDING } from '~/constant/status';
import {
    EjyyBuildingInfo,
    EjyyPropertyFee,
    EjyyCommunityInfo,
    EjyyPropertyFeeOrder,
    EjyyPropertyFeeOrderItem
} from '~/types/model';

interface RequestParams {
    community_id: number;
}

const MpPaymentOrderAction = <Action>{
    router: {
        path: '/payment/order/:community_id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestParams>ctx.params;
        const list = [];

        // 收费信息
        const fees = <(EjyyPropertyFee & EjyyCommunityInfo)[]>await ctx.model
            .from('ipms_property_fee')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_property_fee.community_id')
            .where('community_id', community_id)
            .select(
                'ipms_community_info.name as community_name',
                'ipms_property_fee.id',
                'ipms_property_fee.start_year',
                'ipms_property_fee.end_year',
                'ipms_property_fee.house_fee',
                'ipms_property_fee.computed_house_fee_by_area',
                'ipms_property_fee.carport_fee',
                'ipms_property_fee.computed_carport_fee_by_area',
                'ipms_property_fee.warehoure_fee',
                'ipms_property_fee.computed_warehouse_fee_by_area',
                'ipms_property_fee.merchant_fee',
                'ipms_property_fee.computed_merchant_fee_by_area',
                'ipms_property_fee.garage_fee',
                'ipms_property_fee.computed_garage_fee_by_area'
            )
            .orderBy('ipms_property_fee.id', 'desc');

        for (const fee of fees) {
            // 是否存在未支付的订单
            const unpayOrder = <(EjyyPropertyFeeOrder & EjyyPropertyFeeOrderItem & EjyyBuildingInfo)[]>await ctx.model
                .from('ipms_property_fee_order')
                .leftJoin(
                    'ipms_property_fee_order_item',
                    'ipms_property_fee_order_item.property_fee_order_id',
                    'ipms_property_fee_order.id'
                )
                .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_property_fee_order_item.building_id')
                .where('ipms_property_fee_order.wechat_mp_user_id', ctx.mpUserInfo.id)
                .andWhere('ipms_property_fee_order.paid', FALSE)
                .andWhere('ipms_property_fee_order.created_at', '>=', Date.now() - config.wechat.pay.payExpire)
                .andWhere('ipms_property_fee_order.property_fee_id', fee.id)
                .andWhere('ipms_property_fee_order.cancel', FALSE)
                .whereNotNull('ipms_property_fee_order.prepay_id')
                .select(
                    'ipms_property_fee_order.id',
                    'ipms_property_fee_order.created_at',
                    'ipms_property_fee_order_item.building_id',
                    'ipms_building_info.id as building_id',
                    'ipms_building_info.type',
                    'ipms_building_info.area',
                    'ipms_building_info.building',
                    'ipms_building_info.unit',
                    'ipms_building_info.number',
                    'ipms_building_info.construction_area',
                    'ipms_property_fee_order_item.fee'
                );

            const uncreateOrder = <EjyyBuildingInfo[]>await ctx.model
                .from('ipms_user_building')
                .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
                .where('ipms_building_info.community_id', community_id)
                .andWhere('ipms_user_building.wechat_mp_user_id', ctx.mpUserInfo.id)
                .andWhere('ipms_user_building.status', BINDING_BUILDING)
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
                        .where('ipms_property_fee.id', fee.id)
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

            if (unpayOrder.length || uncreateOrder.length) {
                list.push({
                    fee,
                    unpayOrder,
                    uncreateOrder
                });
            }
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default MpPaymentOrderAction;
