/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { SYSTEM_NOTICE } from '~/constant/notice';
import { TRUE, BINDING_BUILDING } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpNoticeUnreadAction = <Action>{
    router: {
        path: '/notice/unread',
        method: 'post',
        authRequired: true,
        verifyIntact: true
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
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_notice_to_user')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_notice_to_user.community_id')
            .where(function() {
                this.whereIn('ipms_notice_to_user.community_id', function() {
                    this.from('ipms_user_building')
                        .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
                        .where('status', BINDING_BUILDING)
                        .andWhere('wechat_mp_user_id', ctx.mpUserInfo.id)
                        .select('ipms_building_info.community_id');
                }).orWhere('ipms_notice_to_user.refer', SYSTEM_NOTICE);
            })
            .whereNotIn('ipms_notice_to_user.id', function() {
                this.from('ipms_notice_to_user_readed')
                    .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                    .select('notice_id');
            })
            .andWhere('ipms_notice_to_user.created_at', '>=', ctx.mpUserInfo.created_at)
            .andWhere('ipms_notice_to_user.published', TRUE)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_notice_to_user.id'))
            .select(
                'ipms_notice_to_user.id',
                'ipms_notice_to_user.title',
                'ipms_notice_to_user.overview',
                'ipms_notice_to_user.refer',
                'ipms_community_info.name as scope',
                'ipms_notice_to_user.created_at'
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

export default MpNoticeUnreadAction;
