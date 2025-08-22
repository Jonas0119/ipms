/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestParams {
    id: number;
}

const PcPartyDetailAction = <Action>{
    router: {
        path: '/party/detail/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.ANYONE]
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const detail = await ctx.model
            .from('ipms_party')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_party.created_by')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_party.community_id')
            .where('ipms_party.id', id)
            .select(
                'ipms_party.id',
                'ipms_party.title',
                'ipms_party.cover_img',
                'ipms_party.carousel',
                'ipms_party.content',
                'ipms_party.created_at',
                'ipms_party.published',
                'ipms_party.published_at',
                'ipms_party.created_by',
                'ipms_party.published_by',
                'ipms_property_company_user.real_name',
                'ipms_community_info.name as community_name'
            )
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的党建党讯'
            });
        }

        let published_real_name = null;

        if (detail.published_by) {
            const pInfo = await ctx.model
                .from('ipms_property_company_user')
                .where('id', detail.published_by)
                .first();

            published_real_name = pInfo.real_name;
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                ...detail,
                published_real_name
            }
        };
    }
};

export default PcPartyDetailAction;
