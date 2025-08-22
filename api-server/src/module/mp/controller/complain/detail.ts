/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { ALLOT_COMPLAIN_STEP } from '~/constant/complain';

interface RequestParams {
    id: number;
}

import {
    EjyyComplain,
    EjyyPropertyCompanyUser,
    EjyyCommunityInfo,
    EjyyPropertyCompanyDepartment,
    EjyyPropertyCompanyJob
} from '~/types/model';

const MpComplainDetailAction = <Action>{
    router: {
        path: '/complain/detail/:id',
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
        let allotInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;
        let disposedInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;
        let mergeDetail = <EjyyComplain & EjyyCommunityInfo>null;

        const findDetail = async (compain_id: number): Promise<EjyyComplain & EjyyCommunityInfo> => {
            return await ctx.model
                .from('ipms_complain')
                .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_complain.community_id')
                .where('ipms_complain.id', compain_id)
                .andWhere('ipms_complain.wechat_mp_user_id', ctx.mpUserInfo.id)
                .select(
                    'ipms_complain.id',
                    'ipms_complain.type',
                    'ipms_complain.category',
                    'ipms_complain.description',
                    'ipms_complain.complain_imgs',
                    'ipms_complain.allot_user_id',
                    'ipms_complain.alloted_at',
                    'ipms_complain.dispose_user_id',
                    'ipms_complain.dispose_reply',
                    'ipms_complain.dispose_content',
                    'ipms_complain.dispose_imgs',
                    'ipms_complain.disposed_at',
                    'ipms_complain.finished_at',
                    'ipms_complain.merge_id',
                    'ipms_complain.step',
                    'ipms_complain.rate',
                    'ipms_complain.rate_content',
                    'ipms_complain.rated_at',
                    'ipms_complain.created_at',
                    'ipms_community_info.name as community_name'
                )
                .first();
        };

        const selfDetail = await findDetail(id);

        if (!selfDetail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL
            });
        }

        // 如果工单被合并了
        if (selfDetail.merge_id) {
            mergeDetail = await findDetail(selfDetail.merge_id);
        }

        const realDetail = <EjyyComplain & EjyyCommunityInfo>(
            (selfDetail.merge_id ? { ...mergeDetail, merge_id: selfDetail.merge_id } : selfDetail)
        );

        if (realDetail.step >= ALLOT_COMPLAIN_STEP) {
            allotInfo = await ctx.model
                .from('ipms_property_company_user')
                .leftJoin(
                    'ipms_property_company_department',
                    'ipms_property_company_department.id',
                    'ipms_property_company_user.department_id'
                )
                .leftJoin(
                    'ipms_property_company_job',
                    'ipms_property_company_job.id',
                    'ipms_property_company_user.job_id'
                )
                .where('ipms_property_company_user.id', realDetail.allot_user_id)
                .select(
                    'ipms_property_company_user.avatar_url',
                    'ipms_property_company_user.phone',
                    'ipms_property_company_department.name as department',
                    'ipms_property_company_job.name as job',
                    'ipms_property_company_user.real_name'
                )
                .first();

            disposedInfo = await ctx.model
                .from('ipms_property_company_user')
                .leftJoin(
                    'ipms_property_company_department',
                    'ipms_property_company_department.id',
                    'ipms_property_company_user.department_id'
                )
                .leftJoin(
                    'ipms_property_company_job',
                    'ipms_property_company_job.id',
                    'ipms_property_company_user.job_id'
                )
                .where('ipms_property_company_user.id', realDetail.dispose_user_id)
                .select(
                    'ipms_property_company_user.avatar_url',
                    'ipms_property_company_user.phone',
                    'ipms_property_company_department.name as department',
                    'ipms_property_company_job.name as job',
                    'ipms_property_company_user.real_name'
                )
                .first();
        }

        delete realDetail.allot_user_id;
        delete realDetail.dispose_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                ...realDetail,
                complain_imgs: realDetail.complain_imgs ? realDetail.complain_imgs.split('#') : [],
                dispose_imgs: realDetail.dispose_imgs ? realDetail.dispose_imgs.split('#') : [],
                allotInfo,
                disposedInfo
            }
        };
    }
};

export default MpComplainDetailAction;
