/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';
import * as payService from '~/service/pay';
import { PAY_SUCCESS, REFUND_SUCCESS } from '~/constant/pay';
import moment from 'moment';

interface RequestBody {
    community_id: number;
    order_id: number;
    order_item_id: number;
}

const PcPaymentRefundQueryAction = <Action>{
    router: {
        path: '/payment/refund_query',
        method: 'post',
        authRequired: true,
        roles: [ROLE.CWGL],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'order_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'order_item_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { order_id, community_id, order_item_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ipms_property_fee_order_item')
            .leftJoin(
                'ipms_property_fee_order',
                'ipms_property_fee_order.id',
                'ipms_property_fee_order_item.property_fee_order_id'
            )
            .leftJoin('ipms_property_fee', 'ipms_property_fee.id', 'ipms_property_fee_order.property_fee_id')
            .where('ipms_property_fee_order.id', order_id)
            .where('ipms_property_fee_order_item.id', order_item_id)
            .andWhere('ipms_property_fee.community_id', community_id)
            .whereNotNull('ipms_property_fee_order_item.refund_apply_at')
            .select(
                'ipms_property_fee_order_item.id',
                'ipms_property_fee_order_item.fee',
                'ipms_property_fee_order_item.refund_apply_at',
                'ipms_property_fee_order_item.refund_by',
                'ipms_property_fee_order_item.refund',
                'ipms_property_fee_order.created_at',
                'ipms_property_fee_order.paid',
                'ipms_property_fee_order.is_cash',
                'ipms_property_fee_order.fee as total_fee'
            )
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '订单不存在'
            });
        }

        if (detail.paid === FALSE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '订单状态错误'
            });
        }

        if (detail.refund === TRUE || detail.is_cash) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '订单已退款'
            });
        }

        const res = await payService.refundQuery({
            order_id,
            order_item_id,
            created_at: detail.created_at
        });

        if (res.return_code !== PAY_SUCCESS || res.result_code !== PAY_SUCCESS) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: `查询退款失败，${res.return_msg}`
            });
        }

        const index = res.items.findIndex(
            item => item.out_refund_no === payService.tradeNo(detail.created_at, order_item_id)
        );

        if (index > -1) {
            const refundResult = res.items[index];

            if (refundResult.refund_status === PAY_SUCCESS) {
                await ctx.model
                    .from('ipms_property_fee_order_item')
                    .update({
                        refund_at: refundResult.refund_success_time
                            ? moment(refundResult.refund_success_time, 'YYYY-MM-DD HH:mm:ss').valueOf()
                            : null,
                        refund_id: refundResult.refund_id,
                        refund: TRUE,
                        refund_fee: refundResult.refund_fee,
                        refund_account: refundResult.refund_account,
                        refund_recv_accout: refundResult.refund_recv_accout,
                        refund_status: REFUND_SUCCESS
                    })
                    .where('property_fee_order_id', order_id)
                    .where('id', order_item_id);

                const hasRefundItem = await ctx.model
                    .from('ipms_property_fee_order_item')
                    .whereNotNull('refund_apply_at')
                    .andWhere('refund', FALSE)
                    .first();

                if (!hasRefundItem) {
                    await ctx.model
                        .from('ipms_property_fee_order')
                        .update('refunded', TRUE)
                        .where('id', order_id);
                }

                return (ctx.body = {
                    code: SUCCESS,
                    message: '退款查询成功',
                    data: {
                        refunded: hasRefundItem ? 0 : 1,
                        refund_at: refundResult.refund_success_time
                            ? moment(refundResult.refund_success_time, 'YYYY-MM-DD HH:mm:ss').valueOf()
                            : null,
                        refund_id: refundResult.refund_id,
                        refund_fee: refundResult.refund_fee,
                        refund_account: refundResult.refund_account,
                        refund_recv_accout: refundResult.refund_recv_accout,
                        refund_status: REFUND_SUCCESS
                    }
                });
            }
        }

        ctx.body = {
            code: SUCCESS,
            message: '退款查询成功',
            data: {}
        };
    }
};

export default PcPaymentRefundQueryAction;
