/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { EjyyUserBuilding } from '~/types/model';
import { SUCCESS, QRCODE_ILLEGAL, QRCODE_EXPIRED, NOT_FOUND_BINDING_BUILDING } from '~/constant/code';
import { AUTHENTICTED_BY_PROPERTY_COMPANY } from '~/constant/authenticated_type';
import utils from '~/utils';
import communityService from '~/service/community';
import config from '~/config';

interface RequestBody {
    qrcontent: string;
}

const MpCommunityBindingByPropertyAction = <Action>{
    router: {
        path: '/community/binding_by_property',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'qrcontent',
                required: true
            }
        ]
    },
    response: async ctx => {
        const { qrcontent } = <RequestBody>ctx.request.body;
        const qrInfo = utils.community.decrypt(qrcontent);

        if (!qrInfo.success || qrInfo.authenticated_type !== AUTHENTICTED_BY_PROPERTY_COMPANY) {
            return (ctx.body = {
                code: QRCODE_ILLEGAL,
                message: '非法二维码，系统已拒绝'
            });
        }

        if (Date.now() - qrInfo.stamp > config.community.expire) {
            return (ctx.body = {
                code: QRCODE_EXPIRED,
                message: '二维码已过期，请重新扫描'
            });
        }

        const buildingsInfo = await ctx.model
            .from('ipms_building_info')
            .leftJoin('ipms_user_building', 'ipms_user_building.building_id', 'ipms_building_info.id')
            .whereIn('ipms_building_info.id', qrInfo.building_ids)
            .where('ipms_user_building.building_id', null)
            .select('ipms_building_info.id');

        if (buildingsInfo.length === 0) {
            return (ctx.body = {
                code: NOT_FOUND_BINDING_BUILDING,
                message: '未检索到需要关联绑定的住宅信息'
            });
        }

        const bindingData: EjyyUserBuilding[] = [];

        for (const buildindInfo of buildingsInfo) {
            bindingData.push({
                building_id: buildindInfo.id,
                wechat_mp_user_id: ctx.mpUserInfo.id,
                authenticated: 1,
                authenticated_type: qrInfo.authenticated_type,
                authenticated_user_id: qrInfo.user_id,
                created_at: Date.now()
            });
        }

        await ctx.model.from('ipms_user_building').insert(bindingData);

        const communityInfo = await communityService(ctx.model, ctx.mpUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                communityInfo
            }
        };
    }
};

export default MpCommunityBindingByPropertyAction;
