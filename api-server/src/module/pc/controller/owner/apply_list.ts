/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    subscribed?: typeof TRUE | typeof FALSE;
    replied?: typeof TRUE | typeof FALSE;
    success?: typeof TRUE | typeof FALSE;
}

const PcOwerApplyListAction = <Action>{
    router: {
        path: '/owner/apply_list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YZDA],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
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
                name: 'replied',
                regex: /^0|1$/
            },
            {
                name: 'subscribed',
                regex: /^0|1$/
            },
            {
                name: 'success',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, page_num, page_size, replied, subscribed, success } = <RequestBody>ctx.request.body;
        const where = {};

        if (replied !== undefined) {
            where['ipms_owner_apply.replied'] = replied;
        }

        if (subscribed !== undefined) {
            where['ipms_owner_apply.subscribed'] = subscribed;
        }

        if (success !== undefined) {
            where['ipms_owner_apply.success'] = success;
        }

        const list = await ctx.model
            .from('ipms_owner_apply')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_owner_apply.wechat_mp_user_id')
            .where(where)
            .andWhere('ipms_owner_apply.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_owner_apply.id'))
            .select(
                'ipms_owner_apply.id',
                'ipms_owner_apply.house',
                'ipms_owner_apply.carport',
                'ipms_owner_apply.warehouse',
                'ipms_owner_apply.subscribed',
                'ipms_owner_apply.replied',
                'ipms_owner_apply.success',
                'ipms_owner_apply.created_at',
                'ipms_wechat_mp_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_owner_apply.id', 'desc');

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

export default PcOwerApplyListAction;
