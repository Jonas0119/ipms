/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import kjhlog from '~/utils/kjhlog';

import { Action } from '~/types/action';
import { SUCCESS, PAYMENT_CREATE_ORDER_FAIL, PAYMENT_BUILDING_ILLEGAL } from '~/constant/code';
import { FALSE, TRUE, BINDING_BUILDING } from '~/constant/status';
import { PAY_SUCCESS, PAY_FAIL } from '~/constant/pay';
import { EjyyBuildingInfo, EjyyCommunityInfo, EjyyPropertyFee } from '~/types/model';
import * as payService from '~/service/pay';
import * as feeService from '~/service/fee';
import utils from '~/utils';
import config from '~/config';

interface RequestBody {
    building_ids: number[];
    fee_id: number;
}

const MpPaymentCreateAction = <Action>{
    router: {
        path: '/payment/create',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'building_ids',
                required: true,
                validator: val => {
                    return Array.isArray(val) && val.every(item => /^\d+$/.test(item));
                }
            },
            {
                name: 'fee_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { fee_id, building_ids } = <RequestBody>ctx.request.body;

        const feeDetail = <EjyyPropertyFee & EjyyCommunityInfo>await ctx.model
            .from('ipms_property_fee')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_property_fee.community_id')
            .where('ipms_property_fee.id', fee_id)
            .select(
                'ipms_property_fee.id',
                'ipms_community_info.name',
                'ipms_property_fee.start_year',
                'ipms_property_fee.end_year',
                'ipms_property_fee.community_id',
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
            .first();

        if (!feeDetail) {
            return (ctx.body = {
                code: PAYMENT_CREATE_ORDER_FAIL,
                message: '非法的物业收费信息'
            });
        }

        const selfBuilding = <EjyyBuildingInfo[]>await ctx.model
            .from('ipms_user_building')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
            .where('ipms_user_building.wechat_mp_user_id', ctx.mpUserInfo.id)
            .andWhere('ipms_user_building.status', BINDING_BUILDING)
            .andWhere('ipms_building_info.community_id', feeDetail.community_id)
            .whereIn('ipms_user_building.building_id', building_ids)
            .select(
                'ipms_building_info.id',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_building_info.construction_area'
            );

        if (selfBuilding.length !== building_ids.length) {
            return (ctx.body = {
                code: PAYMENT_BUILDING_ILLEGAL,
                message: '所属房产参数非法'
            });
        }

        // 查询是否存在下单或支付的
        const paiedItems = await ctx.model
            .from('ipms_property_fee_order')
            .leftJoin(
                'ipms_property_fee_order_item',
                'ipms_property_fee_order_item.property_fee_order_id',
                'ipms_property_fee_order.id'
            )
            .where('ipms_property_fee_order.property_fee_id', feeDetail.id)
            .andWhere('ipms_property_fee_order.cancel', FALSE)
            .whereIn('ipms_property_fee_order_item.building_id', building_ids)
            .where(function() {
                this.where(function() {
                    // 支付了 没有退款 并且没有申请退款；
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

        if (paiedItems.length > 0) {
            return (ctx.body = {
                code: PAYMENT_CREATE_ORDER_FAIL,
                message: '存在已支付或待支付的订单，请刷新后重试'
            });
        }

        // 生成订单
        const created_at = Date.now();
        const items = [];
        const goods = [];
        let total_fee = 0;

        selfBuilding.forEach(detail => {
            const fee = feeService.computed(detail, feeDetail);

            total_fee += fee;

            items.push({
                building_id: detail.id,
                fee
            });

            goods.push({
                goods_id: detail.id,
                goods_name: `${feeDetail.start_year}至${feeDetail.end_year}年${utils.building.name(detail)}物业费`,
                quantity: 1,
                price: fee
            });
        });

        const [order_id] = await ctx.model.from('ipms_property_fee_order').insert({
            property_fee_id: feeDetail.id,
            wechat_mp_user_id: ctx.mpUserInfo.id,
            fee: total_fee,
            created_at
        });

        await ctx.model.from('ipms_property_fee_order_item').insert(
            items.map(item => {
                return {
                    ...item,
                    property_fee_order_id: order_id
                };
            })
        );

        const { open_id } = await ctx.model
            .from('ipms_wechat_mp_user')
            .where('id', ctx.mpUserInfo.id)
            .first();

        const payRes = await payService.unifiedOrder({
            community_name: feeDetail.name,
            goods,
            order_id,
            created_at,
            total_fee,
            openid: open_id
        });

        if (payRes.return_code === PAY_FAIL || payRes.result_code === PAY_FAIL) {
            await ctx.model
                .from('ipms_property_fee_order')
                .where('id', order_id)
                .delete();

            await ctx.model
                .from('ipms_property_fee_order_item')
                .where('property_fee_order_id', order_id)
                .delete();

            kjhlog.error(`支付生成订单错误，住宅id：${building_ids.join(',')}，微信错误码：${payRes.return_code}`);

            return (ctx.body = {
                code: PAYMENT_CREATE_ORDER_FAIL,
                message: payRes.return_msg || '物业公司商户信息配置错误，请稍后重试'
            });
        }

        if (payRes.return_code === PAY_SUCCESS && payRes.result_code === PAY_SUCCESS) {
            await ctx.model
                .from('ipms_property_fee_order')
                .where('id', order_id)
                .update({
                    prepay_id: payRes.prepay_id
                });
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                order_id
            }
        };
    }
};

export default MpPaymentCreateAction;
