/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import {
    EjyyQuestionnaire,
    EjyyQuestion,
    EjyyQuestionOption,
    EjyyQuestionnaireAnswer,
    EjyyQuestionnaireAnswerResult
} from '~/types/model';
import { SIGNLE_CHOICE, MULTIPLE_CHOICE } from '~/constant/questionnaire';

interface RequestParams {
    id: number;
}

interface Option {
    id: number;
    option_val: string;
}

interface Question {
    title: string;
    id: number;
    type: typeof SIGNLE_CHOICE | typeof MULTIPLE_CHOICE;
    options: Option[];
    answers: number[];
}

interface QuestionMap {
    [key: number]: Question;
}

type ModelType<T, K extends keyof T> = T[K];

interface ModelAs {
    question_title: ModelType<EjyyQuestion, 'title'>;
    option_id: ModelType<EjyyQuestionOption, 'id'>;
}

const MpQuestionnaireDetailAction = <Action>{
    router: {
        path: '/questionnaire/detail/:id',
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
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const questions = <(EjyyQuestionnaire & EjyyQuestion & EjyyQuestionOption & ModelAs)[]>await ctx.model
            .from('ipms_questionnaire')
            .leftJoin('ipms_question', 'ipms_question.questionnaire_id', 'ipms_questionnaire.id')
            .leftJoin('ipms_question_option', 'ipms_question_option.question_id', 'ipms_question.id')
            .where('ipms_questionnaire.id', id)
            .select(
                'ipms_questionnaire.title',
                'ipms_questionnaire.expire',
                'ipms_question.title as question_title',
                'ipms_question.type',
                'ipms_question_option.id as option_id',
                'ipms_question_option.question_id',
                'ipms_question_option.option_val'
            );

        const answers = <(EjyyQuestionnaireAnswer & EjyyQuestionnaireAnswerResult)[]>await ctx.model
            .from('ipms_questionnaire_answer')
            .leftJoin(
                'ipms_questionnaire_answer_result',
                'ipms_questionnaire_answer_result.answer_id',
                'ipms_questionnaire_answer.id'
            )
            .where('ipms_questionnaire_answer.questionnaire_id', id)
            .andWhere('ipms_questionnaire_answer.wechat_mp_user_id', ctx.mpUserInfo.id)
            .select('ipms_questionnaire_answer_result.question_id', 'ipms_questionnaire_answer_result.option_id');

        const map = <QuestionMap>{};

        questions.forEach(({ question_id, question_title, type, option_id, option_val }) => {
            if (!(question_id in map)) {
                map[question_id] = {
                    title: question_title,
                    id: question_id,
                    type,
                    options: [],
                    answers: []
                };
            }

            map[question_id].options.push({
                id: option_id,
                option_val
            });
        });

        answers.forEach(({ question_id, option_id }) => {
            if (question_id in map) {
                map[question_id].answers.push(option_id);
            }
        });

        const { content: statistics } = await ctx.model
            .from('ipms_questionnaire_statistics')
            .where('questionnaire_id', id)
            .first();

        ctx.body = {
            code: SUCCESS,
            data: {
                title: questions[0].title,
                expire: questions[0].expire,
                questions: Object.values(map),
                statistics
            }
        };
    }
};

export default MpQuestionnaireDetailAction;
