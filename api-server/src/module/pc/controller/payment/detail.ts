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
    id: number;
    community_id: number;
}

const PcPaymentDetailAction = <Action>{
    router: {
        path: '/payment/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.CWGL],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_property_fee')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_property_fee.created_by')
            .where('ipms_property_fee.community_id', community_id)
            .where('ipms_property_fee.id', id)
            .select(
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
                'ipms_property_fee.computed_garage_fee_by_area',
                'ipms_property_fee.wechat_push',
                'ipms_property_fee.sms_push',
                'ipms_property_fee.created_at',
                'ipms_property_fee.created_by',
                'ipms_property_company_user.real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取物业收费信息'
            });
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                ...info,
                payExpire: config.wechat.pay.payExpire,
                refoundExpire: config.wechat.pay.refoundExpire
            }
        };
    }
};

export default PcPaymentDetailAction;
