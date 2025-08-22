/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import config from '~/config';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpPaymentListAction = <Action>{
    router: {
        path: '/payment/list',
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

        const list = await ctx.model
            .from('ipms_property_fee_order')
            .leftJoin('ipms_property_fee', 'ipms_property_fee.id', 'ipms_property_fee_order.property_fee_id')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_property_fee.community_id')
            .where('ipms_property_fee_order.wechat_mp_user_id', ctx.mpUserInfo.id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_property_fee_order.id'))
            .select(
                'ipms_community_info.name as community_name',
                'ipms_property_fee.start_year',
                'ipms_property_fee.end_year',
                'ipms_property_fee.house_fee',
                'ipms_property_fee_order.id as order_id',
                'ipms_property_fee_order.transaction_id',
                'ipms_property_fee_order.paid',
                'ipms_property_fee_order.refunding',
                'ipms_property_fee_order.refunded',
                'ipms_property_fee_order.cancel',
                'ipms_property_fee_order.fee',
                'ipms_property_fee_order.paid_fee',
                'ipms_property_fee_order.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_property_fee_order.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size,
                payExpire: config.wechat.pay.payExpire
            }
        };
    }
};

export default MpPaymentListAction;
