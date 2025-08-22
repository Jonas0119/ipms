/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import config from '~/config';

interface RequestBody {
    community_id: number;
    order_id: number;
}

const PcPaymentOrderDetailAction = <Action>{
    router: {
        path: '/payment/order_detail',
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
                name: 'order_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, order_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_property_fee_order')
            .leftJoin('ipms_property_fee', 'ipms_property_fee.id', 'ipms_property_fee_order.property_fee_id')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_property_fee_order.wechat_mp_user_id')
            .where('ipms_property_fee_order.id', order_id)
            .andWhere('ipms_property_fee.community_id', community_id)
            .select(
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
                'ipms_property_fee.computed_garage_fee_by_area',
                'ipms_property_fee.wechat_push',
                'ipms_property_fee.sms_push',
                'ipms_property_fee_order.id as order_id',
                'ipms_property_fee_order.wechat_mp_user_id',
                'ipms_property_fee_order.transaction_id',
                'ipms_property_fee_order.paid',
                'ipms_property_fee_order.paid_at',
                'ipms_property_fee_order.refunded',
                'ipms_property_fee_order.refunding',
                'ipms_property_fee_order.cancel',
                'ipms_property_fee_order.cancel_at',
                'ipms_property_fee_order.is_cash',
                'ipms_property_fee_order.fee',
                'ipms_property_fee_order.paid_fee',
                'ipms_property_fee_order.created_at',
                'ipms_wechat_mp_user.real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '订单不存在'
            });
        }

        const items = await ctx.model
            .from('ipms_property_fee_order_item')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_property_fee_order_item.building_id')
            .leftJoin(
                'ipms_property_company_user',
                'ipms_property_company_user.id',
                'ipms_property_fee_order_item.refund_by'
            )
            .where('ipms_property_fee_order_item.property_fee_order_id', order_id)
            .select(
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_building_info.construction_area',
                'ipms_property_fee_order_item.building_id',
                'ipms_property_fee_order_item.id',
                'ipms_property_fee_order_item.fee',
                'ipms_property_fee_order_item.refund',
                'ipms_property_fee_order_item.refund_id',
                'ipms_property_fee_order_item.refund_fee',
                'ipms_property_fee_order_item.refund_status',
                'ipms_property_fee_order_item.refund_apply_at',
                'ipms_property_fee_order_item.refund_at',
                'ipms_property_fee_order_item.refund_recv_accout',
                'ipms_property_fee_order_item.refund_account',
                'ipms_property_fee_order_item.refund_request_source',
                'ipms_property_company_user.id as operate_user_id',
                'ipms_property_company_user.real_name as operate_user_real_name'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                info: {
                    ...info,
                    payExpire: config.wechat.pay.payExpire,
                    refoundExpire: config.wechat.pay.refoundExpire
                },
                items
            }
        };
    }
};

export default PcPaymentOrderDetailAction;
