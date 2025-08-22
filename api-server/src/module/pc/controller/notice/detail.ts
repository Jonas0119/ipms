/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { OA_NOTICE_COMMUNITY_USER_STOP_WATER, OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY } from '~/constant/tpl';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcNoticeDetailAction = <Action>{
    router: {
        path: '/notice/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQTZ],
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
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ipms_notice_to_user')
            .leftJoin('ipms_notice_tpl', 'ipms_notice_tpl.id', 'ipms_notice_to_user.notice_tpl_id')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_notice_to_user.created_by')
            .where('ipms_notice_to_user.id', id)
            .andWhere('ipms_notice_to_user.community_id', community_id)
            .select(
                'ipms_notice_to_user.id',
                'ipms_notice_to_user.title',
                'ipms_notice_to_user.overview',
                'ipms_notice_to_user.content',
                'ipms_notice_to_user.created_at',
                'ipms_notice_to_user.notice_tpl_id',
                'ipms_notice_to_user.published',
                'ipms_notice_to_user.published_at',
                'ipms_notice_to_user.created_by',
                'ipms_notice_to_user.published_by',
                'ipms_notice_tpl.tpl',
                'ipms_notice_tpl.content as tpl_content',
                'ipms_property_company_user.real_name'
            )
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的通知'
            });
        }

        detail.tpl_content = JSON.parse(detail.tpl_content);

        let tpl_title = '非法模板';

        switch (detail.tpl) {
            case OA_NOTICE_COMMUNITY_USER_STOP_WATER:
                tpl_title = '停水通知';
                break;

            case OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY:
                tpl_title = '停电通知';
                break;
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
                tpl_title,
                published_real_name
            }
        };
    }
};

export default PcNoticeDetailAction;
