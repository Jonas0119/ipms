/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { SYSTEM_NOTICE } from '~/constant/notice';
import { TRUE, BINDING_BUILDING } from '~/constant/status';
import utils from '~/utils';

interface RequestParams {
    community_id: number;
}

const MpHomeMainAction = <Action>{
    router: {
        path: '/home/main/:community_id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        const { community_id } = <RequestParams>ctx.params;

        const topic = await ctx.model
            .from('ipms_topic')
            .where('published', TRUE)
            .andWhere('community_id', community_id)
            .select('id', 'banner_img', 'title')
            .orderBy('id', 'desc');

        // removed obsolete field

        const unread_amount = utils.sql.countReader(
            await ctx.model
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
                .count()
        );

        const notice = await ctx.model
            .from('ipms_notice_to_user')
            .where('community_id', community_id)
            .andWhere('published', TRUE)
            .limit(3)
            .offset(0)
            .select('id', 'title', 'overview', 'created_at')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                topic,
                unread_amount,
                notice
            }
        };
    }
};

export default MpHomeMainAction;
