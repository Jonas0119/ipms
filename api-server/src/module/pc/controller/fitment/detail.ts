/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { PROPERTY_COMPANY_ALLOW_STEP, PROPERTY_COMPANY_CONFIRM_STEP } from '~/constant/fitment';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcFitmentDetailAction = <Action>{
    router: {
        path: '/fitment/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZXDJ],
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
        let agreeUserInfo = null;
        let confirmUserInfo = null;
        let reutrnUserInfo = null;

        const info = await ctx.model
            .from('ipms_fitment')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_fitment.building_id')
            .leftJoin('ipms_community_setting', 'ipms_community_setting.community_id', 'ipms_fitment.community_id')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_fitment.wechat_mp_user_id')
            .where('ipms_fitment.community_id', community_id)
            .where('ipms_fitment.id', id)
            .select(
                'ipms_fitment.id',
                'ipms_fitment.wechat_mp_user_id',
                'ipms_fitment.step',
                'ipms_fitment.agree_user_id',
                'ipms_fitment.agreed_at',
                'ipms_fitment.cash_deposit',
                'ipms_fitment.finished_at',
                'ipms_fitment.confirm_user_id',
                'ipms_fitment.confirmed_at',
                'ipms_fitment.return_name',
                'ipms_fitment.return_bank',
                'ipms_fitment.return_bank_id',
                'ipms_fitment.return_operate_user_id',
                'ipms_fitment.is_return_cash_deposit',
                'ipms_fitment.returned_at',
                'ipms_fitment.created_at',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_community_setting.fitment_pledge',
                'ipms_wechat_mp_user.real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取装修登记信息'
            });
        }

        if (info.step >= PROPERTY_COMPANY_ALLOW_STEP) {
            agreeUserInfo = await ctx.model
                .from('ipms_property_company_user')
                .where('id', info.agree_user_id)
                .select('id', 'real_name')
                .first();
        }

        if (info.step === PROPERTY_COMPANY_CONFIRM_STEP) {
            confirmUserInfo = await ctx.model
                .from('ipms_property_company_user')
                .where('id', info.confirm_user_id)
                .select('id', 'real_name')
                .first();

            if (info.return_operate_user_id) {
                reutrnUserInfo = await ctx.model
                    .from('ipms_property_company_user')
                    .where('id', info.return_operate_user_id)
                    .select('id', 'real_name')
                    .first();
            }
        }

        delete info.agree_user_id;
        delete info.confirm_user_id;
        delete info.return_operate_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                agreeUserInfo,
                confirmUserInfo,
                reutrnUserInfo
            }
        };
    }
};

export default PcFitmentDetailAction;
