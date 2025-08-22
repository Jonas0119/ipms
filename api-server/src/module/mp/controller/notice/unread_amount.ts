/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { SYSTEM_NOTICE } from '~/constant/notice';
import { TRUE, BINDING_BUILDING } from '~/constant/status';

// 新版废弃，移动到home main下
const MpNoticeUnreadAmountAction = <Action>{
    router: {
        path: '/notice/unread_amount',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        const [res] = await ctx.model
            .from('ipms_notice_to_user')
            .where(function() {
                this.whereIn('community_id', function() {
                    this.from('ipms_user_building')
                        .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
                        .where('status', BINDING_BUILDING)
                        .andWhere('wechat_mp_user_id', ctx.mpUserInfo.id)
                        .select('ipms_building_info.community_id');
                }).orWhere('refer', SYSTEM_NOTICE);
            })
            .whereNotIn('id', function() {
                this.from('ipms_notice_to_user_readed')
                    .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                    .select('notice_id');
            })
            .andWhere('published', TRUE)
            .andWhere('created_at', '>=', ctx.mpUserInfo.created_at)
            .count({ count: 'id' });

        ctx.body = {
            code: SUCCESS,
            data: {
                unread_amount: res.count
            }
        };
    }
};

export default MpNoticeUnreadAmountAction;
