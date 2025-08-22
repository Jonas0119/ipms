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
    published?: typeof TRUE | typeof FALSE;
}

const PcNoticeListAction = <Action>{
    router: {
        path: '/notice/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQTZ],
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
                name: 'published',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, published } = <RequestBody>ctx.request.body;
        const where = {};

        if (published !== undefined) {
            where['ipms_notice_to_user.published'] = published;
        }

        const list = await ctx.model
            .from('ipms_notice_to_user')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_notice_to_user.created_by')
            .where('ipms_notice_to_user.community_id', community_id)
            .andWhere(where)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_notice_to_user.id'))
            .select(
                'ipms_notice_to_user.id',
                'ipms_notice_to_user.title',
                'ipms_notice_to_user.published',
                'ipms_notice_to_user.published_at',
                'ipms_notice_to_user.notice_tpl_id',
                'ipms_notice_to_user.created_by',
                'ipms_notice_to_user.created_at',
                'ipms_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_notice_to_user.id', 'desc');

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

export default PcNoticeListAction;
