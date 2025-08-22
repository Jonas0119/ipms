/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import {
    USER_SUBMIT_APPLY_STEP,
    PROPERTY_COMPANY_ALLOW_STEP,
    USER_FINISH_FITMENT_STEP,
    PROPERTY_COMPANY_CONFIRM_STEP
} from '~/constant/fitment';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    step?:
        | typeof USER_SUBMIT_APPLY_STEP
        | typeof PROPERTY_COMPANY_ALLOW_STEP
        | typeof USER_FINISH_FITMENT_STEP
        | typeof PROPERTY_COMPANY_CONFIRM_STEP;
    is_return_cash_deposit?: boolean;
}

const PcFitmentListAction = <Action>{
    router: {
        path: '/fitment/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZXDJ],
        verifyCommunity: true
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
                name: 'step',
                regex: /^1|2|3|4$/
            },
            {
                name: 'is_return_cash_deposit',
                regex: /^1|0$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, step, is_return_cash_deposit } = <RequestBody>ctx.request.body;
        const where = {};

        if (step) {
            where['ipms_fitment.step'] = step;
        }

        if (is_return_cash_deposit !== undefined) {
            where['ipms_fitment.is_return_cash_deposit'] = is_return_cash_deposit;
        }

        const list = await ctx.model
            .from('ipms_fitment')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_fitment.building_id')
            .where('ipms_fitment.community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_fitment.id'))
            .select(
                'ipms_fitment.id',
                'ipms_fitment.step',
                'ipms_fitment.is_return_cash_deposit',
                'ipms_fitment.created_at',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_fitment.id', 'desc');

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

export default PcFitmentListAction;
