/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    page_num: number;
    page_size: number;
    published: typeof TRUE | typeof FALSE;
}

const PcTopicListAction = <Action>{
    router: {
        path: '/topic/list',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.ZTGL]
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
                name: 'published',
                validator: val => [TRUE, FALSE].includes(val)
            }
        ]
    },
    response: async ctx => {
        const { community_id, page_num, page_size, published } = <RequestBody>ctx.request.body;
        const where = {};

        if (published !== undefined) {
            where['ipms_topic.published'] = published;
        }

        const list = await ctx.model
            .from('ipms_topic')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_topic.created_by')
            .where(where)
            .andWhere('ipms_topic.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_topic.id'))
            .select(
                'ipms_topic.id',
                'ipms_topic.banner_img',
                'ipms_topic.title',
                'ipms_topic.published',
                'ipms_topic.created_at',
                'ipms_topic.created_by',
                'ipms_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_topic.id', 'desc');

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

export default PcTopicListAction;
