/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import kjhlog from '~/utils/kjhlog';

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { SUBMIT_COMPLAIN_STEP, ALLOT_COMPLAIN_STEP } from '~/constant/complain';
import * as ROLE from '~/constant/role_access';
import * as wechatService from '~/service/wechat';
import { MP_COMPLAIN_ALLOT_TPL, OA_NOTICE_TO_PROPERTY_COMPANY_USER } from '~/constant/tpl';
import utils from '~/utils';
import moment from 'moment';
import config from '~/config';

interface RequestBody {
    community_id: number;
    id: number;
    dispose_user_id: number;
}

const PcComplainAllotAction = <Action>{
    router: {
        path: '/complain/allot',
        method: 'post',
        authRequired: true,
        roles: [ROLE.TSJY],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'dispose_user_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id, dispose_user_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ipms_complain')
            .where('id', id)
            .andWhere('community_id', community_id)
            .andWhere('step', SUBMIT_COMPLAIN_STEP)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法维修工单'
            });
        }

        const disposedInfo = await ctx.model
            .from('ipms_property_company_user')
            .leftJoin(
                'ipms_wechat_official_accounts_user',
                'ipms_wechat_official_accounts_user.union_id',
                'ipms_property_company_user.union_id'
            )
            .where('ipms_property_company_user.id', dispose_user_id)
            .select(
                'ipms_property_company_user.id',
                'ipms_property_company_user.real_name',
                'ipms_wechat_official_accounts_user.open_id',
                'ipms_wechat_official_accounts_user.subscribed'
            )
            .first();

        if (!disposedInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法维修工单'
            });
        }

        const alloted_at = Date.now();
        const { name: community_name } = await ctx.model
            .from('ipms_community_info')
            .where('id', community_id)
            .first();

        if (detail.dispose_subscribed) {
            const { open_id } = await ctx.model
                .from('ipms_wechat_mp_user')
                .where('id', detail.wechat_mp_user_id)
                .first();

            const res = await wechatService.sendMpSubscribeMessage({
                touser: open_id,
                template_id: MP_COMPLAIN_ALLOT_TPL,
                page: `/pages/complain/detail?id=${id}`,
                data: {
                    thing1: {
                        value: community_name
                    },
                    thing4: {
                        value: '已派单处理'
                    },
                    time7: {
                        value: moment(alloted_at).format('YYYY-MM-DD HH:mm:ss')
                    }
                }
            });

            if (res.errcode !== 0) {
                kjhlog.error(`小程序模板${MP_COMPLAIN_ALLOT_TPL}推送失败，${res.errmsg}`);
            }
        }

        if (disposedInfo.subscribed && disposedInfo.open_id) {
            const res = await wechatService.sendOaTemplateMessage({
                touser: disposedInfo.open_id,
                template_id: OA_NOTICE_TO_PROPERTY_COMPANY_USER,
                miniprogram: {
                    appid: config.wechat.pmp.appid,
                    pagepath: `/pages/complain/detail?id=${id}`
                },
                data: {
                    first: {
                        value: '投诉建议工单提醒'
                    },
                    keyword1: {
                        value: community_name
                    },
                    keyword2: {
                        value: utils.order.num('C', detail.created_at, id)
                    },
                    keyword3: {
                        value: utils.text.omit(detail.description, 22)
                    },
                    keyword4: {
                        value: ctx.pcUserInfo.real_name
                    },
                    keyword5: {
                        value: moment(alloted_at).format('YYYY-MM-DD HH:mm:ss')
                    },
                    remark: {
                        value: '请尽快与业主联系前往处理'
                    }
                }
            });

            if (res.errcode !== 0) {
                kjhlog.error(`公众号推送${OA_NOTICE_TO_PROPERTY_COMPANY_USER}推送失败，${res.errmsg}`);
            }
        }

        await ctx.model
            .from('ipms_complain')
            .update({
                step: ALLOT_COMPLAIN_STEP,
                allot_user_id: ctx.pcUserInfo.id,
                alloted_at,
                dispose_user_id
            })
            .where('id', id);

        delete disposedInfo.open_id;
        delete disposedInfo.subscribed;

        ctx.body = {
            code: SUCCESS,
            data: {
                alloted_at,
                allotInfo: {
                    id: ctx.pcUserInfo.id,
                    real_name: ctx.pcUserInfo.real_name
                },
                disposedInfo
            }
        };
    }
};

export default PcComplainAllotAction;
