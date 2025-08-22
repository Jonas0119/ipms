/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { TRUE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpQuestionnaireAnsweredAction = <Action>{
    router: {
        path: '/questionnaire/answered',
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
            .from('ipms_questionnaire')
            .leftJoin(
                'ipms_questionnaire_answer',
                'ipms_questionnaire_answer.questionnaire_id',
                'ipms_questionnaire.id'
            )
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_questionnaire.community_id')
            .where('ipms_questionnaire_answer.wechat_mp_user_id', ctx.mpUserInfo.id)
            .andWhere('ipms_questionnaire.published', TRUE)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_questionnaire.id'))
            .select(
                'ipms_questionnaire.id',
                'ipms_questionnaire.title',
                'ipms_questionnaire.expire',
                'ipms_questionnaire.published_at',
                'ipms_questionnaire.created_at',
                'ipms_community_info.name as community_name',
                'ipms_questionnaire_answer.created_at as answered_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_questionnaire.id', 'desc');

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

export default MpQuestionnaireAnsweredAction;
