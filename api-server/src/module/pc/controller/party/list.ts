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
    carousel: typeof TRUE | typeof FALSE;
}

const PcPartyListAction = <Action>{
    router: {
        path: '/party/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
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
                name: 'carousel',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, carousel } = <RequestBody>ctx.request.body;

        const where = {};

        if (carousel !== undefined) {
            where['ipms_party.carousel'] = carousel;
        }

        const list = await ctx.model
            .from('ipms_party')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_party.created_by')
            .where('ipms_party.community_id', community_id)
            .andWhere('ipms_party.published', TRUE)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_party.id'))
            .select(
                'ipms_party.id',
                'ipms_party.title',
                'ipms_party.carousel',
                'ipms_party.cover_img',
                'ipms_party.published_at',
                'ipms_party.created_by',
                'ipms_party.created_at',
                'ipms_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_party.id', 'desc');

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

export default PcPartyListAction;
