/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { TRUE } from '~/constant/status';

interface RequestParams {
    id: number;
}

const MpNoticeReadAction = <Action>{
    router: {
        path: '/notice/read/:id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ],
        query: [
            {
                name: 'unread',
                required: true,
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { unread } = ctx.query;
        const { id } = <RequestParams>ctx.params;

        const data = await ctx.model
            .table('ipms_notice_to_user')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_notice_to_user.community_id')
            .andWhere('ipms_notice_to_user.id', id)
            .andWhere('ipms_notice_to_user.published', TRUE)
            .select(
                'ipms_notice_to_user.id',
                'ipms_notice_to_user.title',
                'ipms_notice_to_user.content',
                'ipms_notice_to_user.refer',
                'ipms_community_info.name as scope',
                'ipms_notice_to_user.created_at'
            )
            .first();

        if (!data) {
            return (ctx.body = {
                code: QUERY_ILLEFAL
            });
        }

        if (parseInt(unread as string, 10) === 1) {
            const exit = await ctx.model
                .from('ipms_notice_to_user_readed')
                .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                .andWhere('notice_id', id)
                .first();

            if (!exit) {
                await ctx.model.from('ipms_notice_to_user_readed').insert({
                    notice_id: data.id,
                    wechat_mp_user_id: ctx.mpUserInfo.id,
                    created_at: Date.now()
                });
            }
        }

        ctx.body = {
            code: SUCCESS,
            data
        };
    }
};

export default MpNoticeReadAction;
