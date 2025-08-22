/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpComplainListAction = <Action>{
    router: {
        path: '/complain/list',
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
            .from('ipms_complain')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_complain.community_id')
            .where('ipms_complain.wechat_mp_user_id', ctx.mpUserInfo.id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_complain.id'))
            .select(
                'ipms_complain.id',
                'ipms_complain.type',
                'ipms_complain.category',
                'ipms_complain.description',
                'ipms_complain.step',
                'ipms_complain.merge_id',
                'ipms_complain.created_at',
                'ipms_community_info.name as community_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_complain.id', 'desc');

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

export default MpComplainListAction;
