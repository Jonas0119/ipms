/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { ALLOT_REPAIR_STEP } from '~/constant/repair';
import {
    EjyyRepair,
    EjyyPropertyCompanyUser,
    EjyyBuildingInfo,
    EjyyCommunityInfo,
    EjyyPropertyCompanyDepartment,
    EjyyPropertyCompanyJob
} from '~/types/model';

interface RequestParams {
    id: number;
}

const MpRepairDetailAction = <Action>{
    router: {
        path: '/repair/detail/:id',
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
        let mergeDetail = <EjyyRepair & EjyyBuildingInfo & EjyyCommunityInfo>null;

        const findDetail = async (repair_id: number): Promise<EjyyRepair & EjyyBuildingInfo & EjyyCommunityInfo> => {
            return await ctx.model
                .from('ipms_repair')
                .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_repair.building_id')
                .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_repair.community_id')
                .where('ipms_repair.id', repair_id)
                .andWhere('ipms_repair.wechat_mp_user_id', ctx.mpUserInfo.id)
                .select(
                    'ipms_repair.id',
                    'ipms_repair.repair_type',
                    'ipms_repair.building_id',
                    'ipms_repair.description',
                    'ipms_repair.repair_imgs',
                    'ipms_repair.allot_user_id',
                    'ipms_repair.alloted_at',
                    'ipms_repair.dispose_user_id',
                    'ipms_repair.dispose_reply',
                    'ipms_repair.dispose_content',
                    'ipms_repair.dispose_imgs',
                    'ipms_repair.disposed_at',
                    'ipms_repair.finished_at',
                    'ipms_repair.merge_id',
                    'ipms_repair.step',
                    'ipms_repair.rate',
                    'ipms_repair.rate_content',
                    'ipms_repair.rated_at',
                    'ipms_repair.created_at',
                    'ipms_building_info.type',
                    'ipms_building_info.area',
                    'ipms_building_info.building',
                    'ipms_building_info.unit',
                    'ipms_building_info.number',
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

        const realDetail = <EjyyRepair & EjyyBuildingInfo & EjyyCommunityInfo>(
            (selfDetail.merge_id ? { ...mergeDetail, merge_id: selfDetail.merge_id } : selfDetail)
        );

        if (realDetail.step >= ALLOT_REPAIR_STEP) {
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
                repair_imgs: realDetail.repair_imgs ? realDetail.repair_imgs.split('#') : [],
                dispose_imgs: realDetail.dispose_imgs ? realDetail.dispose_imgs.split('#') : [],
                allotInfo,
                disposedInfo
            }
        };
    }
};

export default MpRepairDetailAction;
