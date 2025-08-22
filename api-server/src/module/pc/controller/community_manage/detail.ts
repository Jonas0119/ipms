/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';

interface RequestParams {
    id: number;
}

const PcCommunityManageDetailAction = <Action>{
    router: {
        path: '/community_manage/detail/:id',
        method: 'get',
        authRequired: true,
        roles: []
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

        const communityInfo = await ctx.model
            .from('ipms_community_info')
            .where('ipms_community_info.id', id)
            .select('id', 'name', 'banner', 'phone', 'province', 'city', 'district', 'created_by', 'created_at')
            .first();

        if (!communityInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在该小区'
            });
        }

        const creatorInfo = await ctx.model
            .from('ipms_property_company_user')
            .leftJoin(
                'ipms_property_company_department',
                'ipms_property_company_department.id',
                'ipms_property_company_user.department_id'
            )
            .leftJoin('ipms_property_company_job', 'ipms_property_company_job.id', 'ipms_property_company_user.job_id')
            .where('ipms_property_company_user.id', communityInfo.created_by)
            .select(
                'ipms_property_company_user.avatar_url',
                'ipms_property_company_user.phone',
                'ipms_property_company_department.name as department',
                'ipms_property_company_job.name as job',
                'ipms_property_company_user.real_name',
                'ipms_property_company_user.created_at'
            )
            .first();

        const setting = await ctx.model
            .from('ipms_community_setting')
            .where('community_id', id)
            .first();

        const convenientList = await ctx.model
            .from('ipms_convenient')
            .where('community_id', id)
            .select('id', 'title', 'location', 'phone')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                communityInfo,
                creatorInfo,
                setting,
                convenientList
            }
        };
    }
};

export default PcCommunityManageDetailAction;
