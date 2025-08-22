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
    phone?: string;
    subscribed?: typeof TRUE | typeof FALSE;
}

const PcOwerListAction = <Action>{
    router: {
        path: '/owner/list',
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
                name: 'phone',
                regex: /^1\d{10}$/
            },
            {
                name: 'subscribed',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, page_num, page_size, phone, subscribed } = <RequestBody>ctx.request.body;
        const where = {};

        if (phone) {
            where['ipms_wechat_mp_user.phone'] = phone;
        }

        const list = await ctx.model
            .from('ipms_wechat_mp_user')
            .leftJoin(
                'ipms_wechat_official_accounts_user',
                'ipms_wechat_official_accounts_user.union_id',
                'ipms_wechat_mp_user.union_id'
            )
            .where(where)
            .whereIn('ipms_wechat_mp_user.id', function() {
                this.from('ipms_building_info')
                    .leftJoin('ipms_user_building', 'ipms_user_building.building_id', 'ipms_building_info.id')
                    .where('ipms_building_info.community_id', community_id)
                    .select('ipms_user_building.wechat_mp_user_id');
            })
            .andWhere(function() {
                if (subscribed !== undefined) {
                    if (subscribed) {
                        this.where('ipms_wechat_official_accounts_user.subscribed', subscribed);
                    } else {
                        this.where('ipms_wechat_official_accounts_user.subscribed', subscribed).orWhereNull(
                            'ipms_wechat_official_accounts_user.subscribed'
                        );
                    }
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_wechat_mp_user.id'))
            .select(
                'ipms_wechat_mp_user.id',
                'ipms_wechat_mp_user.real_name',
                'ipms_wechat_mp_user.nick_name',
                'ipms_wechat_mp_user.gender',
                'ipms_wechat_mp_user.intact',
                'ipms_wechat_mp_user.created_at',
                'ipms_wechat_official_accounts_user.subscribed'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_wechat_mp_user.id', 'desc');

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

export default PcOwerListAction;
