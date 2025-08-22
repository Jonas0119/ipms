/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { Question } from '~/constant/questionnaire';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
}

interface Option {
    id: number;
    option_val: string;
}

interface DetailQuestion extends Omit<Question, 'options'> {
    options: Option[];
}

interface QuestionMap {
    [key: number]: DetailQuestion;
}

const PcQuestionnaireDetailAction = <Action>{
    router: {
        path: '/questionnaire/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WJDC],
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

        const info = await ctx.model
            .from('ipms_questionnaire')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_questionnaire.created_by')
            .where('ipms_questionnaire.id', id)
            .where('ipms_questionnaire.community_id', community_id)
            .select(
                'ipms_questionnaire.id',
                'ipms_questionnaire.title',
                'ipms_questionnaire.expire',
                'ipms_questionnaire.published',
                'ipms_questionnaire.published_at',
                'ipms_questionnaire.created_at',
                'ipms_property_company_user.id as user_id',
                'ipms_property_company_user.real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取问卷信息'
            });
        }

        const questions = await ctx.model
            .from('ipms_question')
            .leftJoin('ipms_question_option', 'ipms_question_option.question_id', 'ipms_question.id')
            .where('ipms_question.questionnaire_id', id)
            .select(
                'ipms_question.title as question_title',
                'ipms_question.type',
                'ipms_question_option.id as option_id',
                'ipms_question_option.question_id',
                'ipms_question_option.option_val'
            );

        const map = <QuestionMap>{};

        questions.forEach(({ question_id, question_title, type, option_id, option_val }) => {
            if (!(question_id in map)) {
                map[question_id] = {
                    title: question_title,
                    type,
                    options: []
                };
            }

            map[question_id].options.push({
                option_val,
                id: option_id
            });
        });

        const { content: statistics } = await ctx.model
            .from('ipms_questionnaire_statistics')
            .where('questionnaire_id', id)
            .first();

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                questions: Object.values(map),
                statistics
            }
        };
    }
};

export default PcQuestionnaireDetailAction;
