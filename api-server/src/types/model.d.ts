/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import {
    TRUE,
    FALSE,
    NORMAL_STATUS,
    FREEZE_STATUS,
    BINDING_BUILDING,
    UNBINDING_BUILDING,
    BINDING_CAR,
    UNBINDING_CAR,
    INTACT_USER_INFO,
    INCOMPLETE_USER_INFO,
    ACCESS_NFC_AVAILABLE,
    ACCESS_NFC_DISABLED,
    ACCESS_QRCODE_AVAILABLE,
    ACCESS_QRCODE_DISABLED,
    ACCESS_REMOTE_DISABLED,
    ACCESS_REMOTE_AVAILABLE,
    FIXMENT_PLEDGE_DISABLED,
    FIXMENT_PLEDGE_AVAILABLE
} from '~/constant/status';
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';
import { OPEARTE_BY_SELF, OPEARTE_BY_FAMILY, OPEARTE_BY_COMPANY } from '~/constant/operate_type';
import {
    AUTHENTICTED_BY_SELF,
    AUTHENTICTED_BY_PROPERTY_COMPANY,
    AUTHENTICTED_BY_FAMILY
} from '../constant/authenticated_type';
import { PRPERTY_COMANDY_NOTICE, SYSTEM_NOTICE } from '~/constant/notice';
import {
    WATER_AND_HEATING,
    ELECTRICITY,
    DOOR_AND_WINDOW,
    PUBLIC_FACILITY,
    SUBMIT_REPAIR_STEP,
    ALLOT_REPAIR_STEP,
    CONFIRM_REPAIR_STEP,
    FINISH_REPAIR_STEP
} from '~/constant/repair';
import { BLUE_PLATE_CAR, YELLOW_PLATE_CAR } from '~/constant/car';
import {
    COMPLAIN,
    SUGGEST,
    COMPLAIN_HEALTH,
    COMPLAIN_NOISE,
    COMPLAIN_SERVICE,
    COMPLAIN_BUILDING,
    COMPLAIN_FIRE_ACCESS,
    COMPLAIN_COMMUNITY_FACILITY,
    COMPLAIN_OTHER,
    SUBMIT_COMPLAIN_STEP,
    ALLOT_COMPLAIN_STEP,
    CONFIRM_COMPLAIN_STEP,
    FINISH_COMPLAIN_STEP
} from '~/constant/complain';
import {
    DOG,
    MALE,
    FEMALE,
    REMOVE_PET_BECAUSE_DIE,
    REMOVE_PET_BECAUSE_LOSE,
    REMOVE_PET_BECAUSE_GIVE,
    REMOVE_PET_BECAUSE_CONFISCATE
} from '~/constant/pet';
import {
    USER_SUBMIT_APPLY_STEP,
    PROPERTY_COMPANY_ALLOW_STEP,
    USER_FINISH_FITMENT_STEP,
    PROPERTY_COMPANY_CONFIRM_STEP
} from '~/constant/fitment';
import {
    MOVE_CAR_BECAUSE_OF_GO_THROUGH,
    MOVE_CAR_BECAUSE_OF_FIRE_ENGINE_ACCESS,
    MOVE_CAR_BECAUSE_OF_BLOCK_ENTRANCE,
    MOVE_CAR_BECAUSE_OF_EFFECT_WORK,
    MOVE_CAR_BECAUSE_OF_OCCUPY_PORT
} from '~/constant/move_car';
import { SIGNLE_CHOICE, MULTIPLE_CHOICE } from '~/constant/questionnaire';
import { QuestionnaireStatistics, Article, TemplateMessage } from '~/types/content';
import { Role } from '~/constant/role_access';
import { FEEDBACK_OF_FEATURE, FEEDBACK_OF_PROBLEM } from '~/constant/feedback';
import { REFUND_SUCCESS, REFUND_CHANGE, REFUND_REFUNDCLOSE } from '~/constant/pay';
import {
    LEAVE_WORKFLOW,
    REFOUND_WORKFLOW,
    PURCHASE_WORKFLOW,
    WORKFLOW_NODE_INITIATE,
    WORKFLOW_NODE_APPROVER,
    WORKFLOW_NODE_CONDITION,
    WORKFLOW_NODE_JUDGE,
    WORKFLOW_NODE_NOTICE,
    OPT_LT,
    OPT_GT,
    OPT_LT_EQUAL,
    EQUAL,
    OPT_GT_EQUAL,
    OPT_BETWEEN,
    CONDITION_DEPARMENT,
    CONDITION_NUMBER
} from '~/constant/workflow';
import { MATERIAL_ORIGIN_INIT, MATERIAL_ORIGIN_BUY, MATERIAL_ORIGIN_TRANSFER } from '~/constant/material';
import {
    IOT_METHOD_QRCODE,
    IOT_METHOD_NFC,
    IOT_METHOD_ICCARD,
    ENTRANCE_KAI_PA_SI,
    IOT_METER_WATER,
    IOT_METER_ELECTRICITY,
    IOT_METER_GAS,
    REPEATER_XUAN_KUN,
    REPEATER_YOU_REN,
    WARNING_OF_WATER,
    WARNING_OF_FIRE,
    WARNING_OF_GAS
} from '~/constant/iot';

declare namespace IpmsModel {
    type Gender = 0 | 1 | 2; //未知 男 女

    interface IpmsWechatMpUser {
        id?: number;
        open_id: string;
        union_id: string;
        nick_name: string;
        real_name: string | null;
        idcard: string | null;
        phone: string | null;
        avatar_url: string | null;
        gender: Gender;
        signature: string;
        // 1 正常 0冻结
        status: typeof NORMAL_STATUS | typeof FREEZE_STATUS;
        intact: typeof INTACT_USER_INFO | typeof INCOMPLETE_USER_INFO;
        created_at: number;
    }

    interface IpmsWechatMpAuth {
        id?: number;
        wechat_mp_user_id: number;
        token: string | null;
    }

    interface IpmsWechatMpUserLogin {
        id?: number;
        wechat_mp_user_id: number;
        ip: string;
        brand: string | null;
        model: string | null;
        system: string | null;
        platform: string | null;
        login_at: number;
    }

    interface IpmsWechatOfficialAccountsUser {
        id?: number;
        union_id: string;
        open_id: string;
        subscribed: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface IpmsPropertyCompanyDepartment {
        id?: number;
        name: string;
    }

    interface IpmsPropertyCompanyJob {
        id?: number;
        parent_id: number;
        name: string;
    }

    // 每个公司都仅有一条员工的记录，所一open_id会有重复
    interface IpmsPropertyCompanyUser {
        id?: number;
        account?: string;
        password?: string;
        open_id?: string;
        union_id?: string;
        real_name?: string;
        idcard?: string;
        gender: Gender;
        avatar_url: string;
        phone?: string;
        department_id?: number;
        job_id?: number;
        access_id?: number;
        admin?: typeof TRUE | typeof FALSE;
        join_company_at?: number;
        // 用户可能会有重复的情况，因为涉及到离职问题，只有非离职状态记录为1
        leave_office: typeof TRUE | typeof FALSE;
        created_by?: number;
        created_at: number;
    }

    interface IpmsPropertyCompanyUserJoinRecord {
        id?: number;
        property_company_user_id: number;
        status: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsPropertyCompanyAuth {
        id?: number;
        property_company_user_id: number;
        token?: string;
    }

    interface IpmsPropertyCompanyUserLogin {
        id?: number;
        property_company_user_id: number;
        ip: string;
        user_agent?: string;
        login_at: number;
    }

    interface IpmsPropertyCompanyUserDefaultCommunity {
        id?: number;
        property_company_user_id: number;
        community_id?: number;
    }

    interface IpmsPropertyCompanyUserAccessCommunity {
        id?: number;
        property_company_user_id: number;
        community_id?: number;
    }

    interface IpmsPropertyCompanyAccess {
        id?: number;
        name: string;
        content: string | typeof Role[];
    }

    interface IpmsPropertyCompanyBuildingRegistered {
        id?: number;
        building_id: number;
        // 业主姓名
        name: string;
        gender: Gender;
        idcard: string;
        phone: string;
        created_by?: number;
        created_at: number;
    }

    interface IpmsCommunityInfo {
        // 非自增id，和apply表的id一致
        id: number;
        name: string;
        banner: string;
        phone: string;
        province: string;
        city: string;
        district: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsCommunitySetting {
        id?: number;
        community_id: number;
        access_nfc: typeof ACCESS_NFC_DISABLED | typeof ACCESS_NFC_AVAILABLE;
        access_qrcode: typeof ACCESS_QRCODE_DISABLED | typeof ACCESS_QRCODE_AVAILABLE;
        access_remote: typeof ACCESS_REMOTE_DISABLED | typeof ACCESS_REMOTE_AVAILABLE;
        carport_max_car: number;
        garage_max_car: number;
        fitment_pledge: typeof FIXMENT_PLEDGE_AVAILABLE | typeof FIXMENT_PLEDGE_DISABLED;
    }

    interface IpmsCommunityRemoteOpenDoorLog {
        id?: number;
        wechat_mp_user_id: number;
        community_id: number;
        door_id: number;
        success: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface IpmsBuildingInfo {
        id?: number;
        community_id: number;
        // 	1 住宅 ；2 车位； 3仓房
        type: typeof HOUSE | typeof CARPORT | typeof WAREHOUSE | typeof MERCHANT | typeof GARAGE;
        area: string;
        building?: string;
        unit?: string;
        number: string;
        construction_area: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsUserBuilding {
        id?: number;
        building_id: number;
        wechat_mp_user_id: number;
        authenticated: typeof TRUE | typeof FALSE;
        // 1 手机号关联；2 物业公司认证 3 业主认证
        authenticated_type:
            | typeof AUTHENTICTED_BY_SELF
            | typeof AUTHENTICTED_BY_PROPERTY_COMPANY
            | typeof AUTHENTICTED_BY_FAMILY;
        authenticated_user_id: number;
        // 	1 正常；0 解绑
        status?: typeof UNBINDING_BUILDING | typeof BINDING_BUILDING;
        created_at: number;
    }

    interface IpmsUserBuildingOperateLog {
        id?: number;
        user_building_id: number;
        wechat_mp_user_id?: number;
        property_company_user_id?: number;
        // 1 解绑；0 绑定
        status?: typeof UNBINDING_BUILDING | typeof BINDING_BUILDING;
        // 	1 用户  2家人 3物业公司
        operate_by: typeof OPEARTE_BY_SELF | typeof OPEARTE_BY_FAMILY | typeof OPEARTE_BY_COMPANY;
        created_at: number;
    }

    interface IpmsUserDefaultCommunity {
        id?: number;
        community_id: number;
        wechat_mp_user_id: number;
    }

    interface IpmsUserCar {
        id?: number;
        wechat_mp_user_id: number;
        building_id: number;
        car_number: string;
        // 1 蓝牌；2 黄牌
        car_type: typeof BLUE_PLATE_CAR | typeof YELLOW_PLATE_CAR;
        is_new_energy: typeof TRUE | typeof FALSE;
        status?: typeof UNBINDING_CAR | typeof BINDING_CAR;
        sync: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    // order id desc 以最后一次结果为准
    interface IpmsUserCarSync {
        id?: number;
        user_car_id: number;
        is_remove: typeof TRUE | typeof FALSE;
    }

    interface IpmsUserCarOperateLog {
        id?: number;
        user_car_id: number;
        wechat_mp_user_id?: number;
        property_company_user_id?: number;
        // 1 解绑；0 绑定
        status?: typeof UNBINDING_CAR | typeof BINDING_CAR;
        // 	1 用户  2家人 3物业公司
        operate_by: typeof OPEARTE_BY_SELF | typeof OPEARTE_BY_FAMILY | typeof OPEARTE_BY_COMPANY;
        created_at: number;
    }

    interface IpmsNoticeToUser {
        id?: number;
        title: string;
        overview: string;
        content: string | Article;
        community_id: number;
        published_by?: number;
        published?: typeof TRUE | typeof FALSE;
        published_at?: number;
        notice_tpl_id?: number;
        // 1 物业公司 2 系统
        refer: typeof PRPERTY_COMANDY_NOTICE | typeof SYSTEM_NOTICE;
        created_by: number;
        created_at: number;
    }

    interface IpmsNoticeTpl {
        id?: number;
        tpl: string;
        content: string | TemplateMessage;
    }

    interface IpmsNoticeToUserReaded {
        id?: number;
        notice_id: number;
        wechat_mp_user_id: number;
        created_at: number;
    }

    interface IpmsFeedback {
        id: number;
        wechat_mp_user_id: number;
        type: typeof FEEDBACK_OF_PROBLEM | typeof FEEDBACK_OF_FEATURE;
        subject: string;
        content: string;
        created_at: number;
        reply?: string;
        reply_user_id?: number;
        replyed_at?: number;
    }

    interface IpmsRepair {
        id?: number;
        wechat_mp_user_id?: number;
        property_company_user_id?: number;
        community_id: number;
        building_id: number;
        repair_type: typeof WATER_AND_HEATING | typeof ELECTRICITY | typeof DOOR_AND_WINDOW | typeof PUBLIC_FACILITY;
        description: string;
        repair_imgs?: string;
        dispose_subscribed: typeof TRUE | typeof FALSE;
        confrim_subscribed: typeof TRUE | typeof FALSE;
        finish_subscribed: typeof TRUE | typeof FALSE;
        allot_user_id?: number;
        alloted_at?: number;
        dispose_user_id?: number;
        dispose_reply?: string;
        dispose_content?: string;
        dispose_imgs?: string;
        disposed_at?: number;
        finished_at?: number;
        merge_id?: number;
        step:
            | typeof SUBMIT_REPAIR_STEP
            | typeof ALLOT_REPAIR_STEP
            | typeof CONFIRM_REPAIR_STEP
            | typeof FINISH_REPAIR_STEP;
        rate?: number;
        rate_content?: string;
        rated_at?: number;
        created_at: number;
    }

    interface IpmsRepairUrge {
        id?: number;
        repair_id: number;
        step:
            | typeof SUBMIT_REPAIR_STEP
            | typeof ALLOT_REPAIR_STEP
            | typeof CONFIRM_REPAIR_STEP
            | typeof FINISH_REPAIR_STEP;
        status: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface IpmsComplain {
        id?: number;
        community_id: number;
        type: typeof COMPLAIN | typeof SUGGEST;
        wechat_mp_user_id?: number;
        property_company_user_id?: number;
        category:
            | typeof COMPLAIN_HEALTH
            | typeof COMPLAIN_NOISE
            | typeof COMPLAIN_SERVICE
            | typeof COMPLAIN_BUILDING
            | typeof COMPLAIN_FIRE_ACCESS
            | typeof COMPLAIN_COMMUNITY_FACILITY
            | typeof COMPLAIN_OTHER;
        description: string;
        complain_imgs?: string;
        dispose_subscribed: typeof TRUE | typeof FALSE;
        confrim_subscribed: typeof TRUE | typeof FALSE;
        finish_subscribed: typeof TRUE | typeof FALSE;
        allot_user_id?: number;
        alloted_at?: number;
        dispose_user_id?: number;
        dispose_reply?: string;
        dispose_content?: string;
        dispose_imgs?: string;
        disposed_at?: number;
        finished_at?: number;
        merge_id?: number;
        step:
            | typeof SUBMIT_COMPLAIN_STEP
            | typeof ALLOT_COMPLAIN_STEP
            | typeof CONFIRM_COMPLAIN_STEP
            | typeof FINISH_COMPLAIN_STEP;
        rate?: number;
        rate_content?: string;
        rated_at?: number;
        created_at: number;
    }

    interface IpmsConvenient {
        id?: number;
        community_id: number;
        title: string;
        location: string;
        phone: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsPropertyFee {
        id?: number;
        start_year: number;
        end_year: number;
        community_id: number;
        house_fee: number;
        computed_house_fee_by_area: typeof TRUE | typeof FALSE;
        carport_fee: number;
        computed_carport_fee_by_area: typeof TRUE | typeof FALSE;
        warehoure_fee: number;
        computed_warehouse_fee_by_area: typeof TRUE | typeof FALSE;
        merchant_fee: number;
        computed_merchant_fee_by_area: typeof TRUE | typeof FALSE;
        garage_fee: number;
        computed_garage_fee_by_area: typeof TRUE | typeof FALSE;
        wechat_push: typeof TRUE | typeof FALSE;
        sms_push: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsPropertyFeeOrder {
        id?: number;
        property_fee_id: number;
        wechat_mp_user_id?: number;
        transaction_id?: string;
        prepay_id: string;
        paid?: typeof TRUE | typeof FALSE;
        paid_at?: number;
        cancel?: typeof TRUE | typeof FALSE;
        cancel_at?: number;
        refunding?: typeof TRUE | typeof FALSE;
        refunded?: typeof TRUE | typeof FALSE;
        fee: number;
        paid_fee?: number;
        is_cash?: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface IpmsPropertyFeeOrderItem {
        id?: number;
        property_fee_order_id: number;
        building_id: number;
        fee: number;
        refund?: typeof TRUE | typeof FALSE;
        refund_at?: number;
        refund_id?: string;
        refund_by?: number;
        refund_fee?: number;
        refund_status?: typeof REFUND_SUCCESS | typeof REFUND_CHANGE | typeof REFUND_REFUNDCLOSE;
        refund_apply_at?: number;
        refund_account?: string;
        refund_request_source?: string;
        refund_recv_accout?: string;
    }

    interface IpmsPet {
        id?: number;
        community_id: number;
        wechat_mp_user_id: number;
        pet_type: typeof DOG;
        name: string;
        sex: typeof MALE | typeof FEMALE;
        photo: string;
        coat_color: string;
        breed: string;
        pet_license?: string;
        pet_license_award_at?: number;
        remove?: typeof TRUE | typeof FALSE;
        remove_reason?:
            | typeof REMOVE_PET_BECAUSE_DIE
            | typeof REMOVE_PET_BECAUSE_LOSE
            | typeof REMOVE_PET_BECAUSE_GIVE
            | typeof REMOVE_PET_BECAUSE_CONFISCATE;
        removed_at?: number;
        created_at: number;
    }

    interface IpmsPetVaccinate {
        id?: number;
        pet_id: number;
        vaccinated_at: number;
        vaccine_type: string;
        created_at: number;
    }

    interface IpmsFitment {
        id?: number;
        community_id: number;
        wechat_mp_user_id: number;
        building_id: number;
        step:
            | typeof USER_SUBMIT_APPLY_STEP
            | typeof PROPERTY_COMPANY_ALLOW_STEP
            | typeof USER_FINISH_FITMENT_STEP
            | typeof PROPERTY_COMPANY_CONFIRM_STEP;
        agree_user_id?: number;
        agreed_at?: number;
        cash_deposit?: number;
        finished_at?: number;
        confirm_user_id?: number;
        confirmed_at?: number;
        return_name?: string;
        return_bank?: string;
        return_bank_id?: string;
        return_operate_user_id?: number;
        is_return_cash_deposit?: typeof TRUE | typeof FALSE;
        returned_at?: number;
        created_at: number;
    }

    interface IpmsMoveCar {
        id?: number;
        community_id: number;
        wechat_mp_user_id: number;
        car_number: string;
        move_reason:
            | typeof MOVE_CAR_BECAUSE_OF_GO_THROUGH
            | typeof MOVE_CAR_BECAUSE_OF_FIRE_ENGINE_ACCESS
            | typeof MOVE_CAR_BECAUSE_OF_BLOCK_ENTRANCE
            | typeof MOVE_CAR_BECAUSE_OF_EFFECT_WORK
            | typeof MOVE_CAR_BECAUSE_OF_OCCUPY_PORT;
        live_img: string;
        subscribed?: typeof TRUE | typeof FALSE;
        have_concat_info: typeof TRUE | typeof FALSE;
        response_user_id?: number;
        response_content?: string;
        responsed_at?: number;
        created_at: number;
    }

    interface IpmsVistor {
        id?: number;
        community_id: number;
        building_id: number;
        wechat_mp_user_id?: number;
        property_company_user_id?: number;
        vistor_name: string;
        vistor_phone: string;
        car_number?: string;
        have_vistor_info: typeof TRUE | typeof FALSE;
        expire: number;
        used_at?: number;
        scan_by?: number;
        created_at: number;
    }

    interface IpmsSchedule {
        id?: number;
        job: string;
        created_at: number;
    }

    interface IpmsQuestionnaire {
        id?: number;
        community_id: number;
        title: string;
        expire: number;
        published?: typeof TRUE | typeof FALSE;
        published_at?: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsQuestion {
        id?: number;
        questionnaire_id: number;
        title: string;
        type: typeof SIGNLE_CHOICE | typeof MULTIPLE_CHOICE;
    }

    interface IpmsQuestionOption {
        id?: number;
        question_id: number;
        option_val: string;
    }

    interface IpmsQuestionnaireStatistics {
        id?: number;
        questionnaire_id: number;
        content: string | QuestionnaireStatistics;
    }

    interface IpmsQuestionnaireAnswer {
        id?: number;
        questionnaire_id: number;
        wechat_mp_user_id: number;
        created_at: number;
    }

    interface IpmsQuestionnaireAnswerResult {
        id?: number;
        answer_id: number;
        question_id: number;
        option_id: number;
    }

    interface IpmsTopic {
        id?: number;
        community_id: number;
        banner_img: string;
        title: string;
        content: string | Article;
        published: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsSessionStore {
        id?: string;
        expire: number;
        data: string;
    }

    interface IpmsContractCategory {
        id?: number;
        name: string;
        description?: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsContract {
        id?: number;
        community_id: number;
        title: string;
        category_id: number;
        first_party: string;
        first_party_linkman: string;
        first_party_phone: string;
        second_party?: string;
        second_party_linkman?: string;
        second_party_phone?: string;
        second_party_wechat_mp_user_id?: number;
        begin_time: number;
        finish_time: number;
        contract_fee: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsContractItem {
        id?: number;
        contract_id: number;
        title: string;
        descritpion?: string;
        building_id?: string;
        attachment_url?: string;
        attachment_name?: string;
        fee: number;
        created_at: number;
    }

    interface IpmsOwerApply {
        id?: number;
        wechat_mp_user_id: number;
        community_name: string;
        house: string;
        carport: string;
        warehouse: string;
        community_id?: number;
        subscribed?: typeof TRUE | typeof FALSE;
        replied?: typeof TRUE | typeof FALSE;
        content?: number[] | string;
        replied_by?: number;
        replied_at?: number;
        success?: typeof TRUE | typeof FALSE;
        reply_content?: string;
        created_at: number;
    }

    interface IpmsOwerDetailLog {
        id?: number;
        wechat_mp_user_id: number;
        property_company_user_id: number;
        created_at: number;
    }

    interface IpmsWorkflow {
        id?: number;
        community_id: number;
        type: typeof LEAVE_WORKFLOW | typeof REFOUND_WORKFLOW | typeof PURCHASE_WORKFLOW;
        latest: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface IpmsWorkflowNode {
        id?: number;
        workflow_id: number;
        type:
            | typeof WORKFLOW_NODE_INITIATE
            | typeof WORKFLOW_NODE_APPROVER
            | typeof WORKFLOW_NODE_CONDITION
            | typeof WORKFLOW_NODE_JUDGE
            | typeof WORKFLOW_NODE_NOTICE;
        from_user_ids?: string | number[];
        from_deparment_ids?: string | number[];
        relation_user_id?: number;
        applicant_assign?: typeof TRUE | typeof FALSE;
        name?: string;
        category?: typeof CONDITION_DEPARMENT | typeof CONDITION_NUMBER;
        value?: string | number[];
        opt?:
            | typeof OPT_LT
            | typeof OPT_GT
            | typeof OPT_LT_EQUAL
            | typeof EQUAL
            | typeof OPT_GT_EQUAL
            | typeof OPT_BETWEEN;
        opt_first_equal?: typeof TRUE | typeof FALSE;
        opt_second_equal?: typeof TRUE | typeof FALSE;
        parent_id?: number;
        created_at: number;
    }

    interface IpmsCustomWorkflow {
        created_by: number;
        community_id: number;
        workflow_id: number;
        success: typeof TRUE | typeof FALSE;
        cancel: typeof TRUE | typeof FALSE;
        step: number;
        canceled_at?: number;
        created_at?: number;
    }

    interface IpmsAskForLeave extends IpmsCustomWorkflow {
        id?: number;
        begin_date: number;
        reason: string;
        total: number;
    }

    interface CustomWorkflowNode {
        id?: number;
        parent_id: number;
        step: number;
        node_type: typeof WORKFLOW_NODE_APPROVER | typeof WORKFLOW_NODE_CONDITION | typeof WORKFLOW_NODE_NOTICE;
        workflow_node_id: number;
        relation_user_id?: number;
        applicant_assign?: typeof TRUE | typeof FALSE;
        finish: typeof TRUE | typeof FALSE;
        refuse_reason?: string;
        finished_at?: number;
    }

    interface IpmsAskForLeaveFlow extends CustomWorkflowNode {}

    interface IpmsRefound extends IpmsCustomWorkflow {
        id?: number;
        begin_date: number;
        finish_date: number;
        reason: string;
        total: number;
    }

    interface IpmsRefoundFlow extends CustomWorkflowNode {}

    interface IpmsRefoundItem {
        id?: number;
        refound_id: number;
        reason: string;
        code: string;
        num: string;
        date: number;
        attachment_url: string;
        fee: number;
    }

    interface IpmsStorehouse {
        id?: number;
        community_id: number;
        name: string;
        local: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsMaterialCategory {
        id?: number;
        name: string;
        description?: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsMaterialSupplier {
        id?: number;
        title: string;
        linkman: string;
        phone: string;
        business: string;
        bank_name?: string;
        bank_id?: string;
        bank_address?: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsMaterial {
        id?: number;
        community_id: number;
        name: string;
        category_id: number;
        storehouse_id: number;
        total: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsMaterialUsed {
        id?: number;
        material_id: number;
        total: number;
        reason: string;
        used_by: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsMaterialPurchase extends IpmsCustomWorkflow {
        id?: number;
        total: number;
        remark?: string;
    }

    interface IpmsMaterialPurchaseFlow extends CustomWorkflowNode {}

    interface IpmsMaterialPurchaseItem {
        id?: number;
        material_id: number;
        origin: typeof MATERIAL_ORIGIN_INIT | typeof MATERIAL_ORIGIN_BUY | typeof MATERIAL_ORIGIN_TRANSFER;
        total: number;
        task_id?: number;
        supplier_id?: number;
        fee?: number;
        finish: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsMeetingRoom {
        id?: number;
        community_id: number;
        name: string;
        local: string;
        have_tv: typeof TRUE | typeof FALSE;
        have_board: typeof TRUE | typeof FALSE;
        have_projector: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsMeeting {
        id?: number;
        community_id: number;
        meeting_room_id: number;
        theme: string;
        start_time: number;
        end_time: number;
        cancel: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsMeetingParticipant {
        id?: number;
        meeting_id: number;
        user_id: number;
    }

    interface IpmsMissionPoint {
        id?: number;
        community_id: number;
        category_id: number;
        local: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsMissionCategory {
        id?: number;
        name: string;
        description?: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsMissionLine {
        id?: number;
        community_id: number;
        name: string;
        category_id: number;
        description: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsMissionLineNode {
        id?: number;
        line_id: number;
        point_id: number;
    }

    interface IpmsMission {
        id?: number;
        community_id: number;
        category_id: number;
        start_date: number;
        end_date: number;
        start_hour: number;
        end_hour: number;
        line_id: number;
        user_id: number;
        cancel: typeof TRUE | typeof FALSE;
        canceled_at?: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsMissionComplete {
        id?: number;
        mission_id: number;
        point_id?: number;
        finish: typeof TRUE | typeof FALSE;
        date: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsMissionCompleteNode {
        id?: number;
        complete_id: number;
        point_id: number;
        normal: typeof TRUE | typeof FALSE;
        remark?: string;
        img1: string;
        img2?: string;
        img3?: string;
        created_at: number;
    }

    interface IpmsInform {
        id?: number;
        title: string;
        cover_img?: string;
        carousel: typeof TRUE | typeof FALSE;
        content: Article | string;
        community_id: number;
        published: typeof TRUE | typeof FALSE;
        published_at?: number;
        published_by?: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsParty {
        id?: number;
        title: string;
        cover_img?: string;
        carousel: typeof TRUE | typeof FALSE;
        content: Article | string;
        community_id: number;
        published: typeof TRUE | typeof FALSE;
        published_at?: number;
        published_by?: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsEmployeeSignSetting {
        id?: number;
        community_id: number;
        lng: number;
        lat: number;
        distance: number;
        latest: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface IpmsEmployeeSignRecord {
        id?: number;
        community_id: number;
        date: number;
        begin: number;
        begin_lat: number;
        begin_lng: number;
        begin_accuracy: number;
        finish?: number;
        finish_lat?: number;
        finish_lng?: number;
        finish_accuracy?: number;
        created_by: number;
    }

    interface IpmsIotEntrance {
        id?: number;
        community_id: number;
        sign: string;
        secret: string;
        name: string;
        building?: string;
        category: typeof ENTRANCE_KAI_PA_SI;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotEntranceLog {
        id?: number;
        wechat_mp_user_id?: number;
        vistor_id?: number;
        entrance_id: number;
        method: typeof IOT_METHOD_QRCODE | typeof IOT_METHOD_NFC | typeof IOT_METHOD_ICCARD;
        created_at: number;
    }

    interface IpmsIotElevator {
        id?: number;
        community_id: number;
        sign: string;
        secret: string;
        name: string;
        building?: string;
        category: typeof ENTRANCE_KAI_PA_SI;
        verify_property_fee: typeof TRUE | typeof FALSE;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotElevatorLog {
        id?: number;
        wechat_mp_user_id?: number;
        vistor_id?: number;
        elevator_id: number;
        method: typeof IOT_METHOD_QRCODE | typeof IOT_METHOD_NFC | typeof IOT_METHOD_ICCARD;
        created_at: number;
    }

    interface IpmsIotLamp {
        id?: number;
        community_id: number;
        name: string;
        sn: string;
        secret: string;
        port_total: number;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotLampLine {
        id?: number;
        name: string;
        port: number;
        off: typeof TRUE | typeof FALSE;
        lamp_id: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotLampWorkMode {
        id?: number;
        lamp_line_id: number;
        start_time: string;
        end_time: string;
        name: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotLampLog {
        id?: number;
        lamp_line_id: number;
        off: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface IpmsIotMeterRepeater {
        id?: number;
        community_id: number;
        name: string;
        sign: string;
        category: typeof REPEATER_YOU_REN | typeof REPEATER_XUAN_KUN;
        username: string;
        password: string;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotMeter {
        id?: number;
        community_id: number;
        // 没有就代表公摊
        building_id?: number;
        name: string;
        password?: string;
        category: typeof IOT_METER_WATER | typeof IOT_METER_ELECTRICITY | typeof IOT_METER_GAS;
        model: string;
        no?: string;
        imei?: string;
        repeater_id?: number;
        init_value: number;
        current_value: number;
        max_value: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotMeterRead {
        id?: number;
        community_id: number;
        meter_id: number;
        from_repeater: typeof TRUE | typeof FALSE;
        last_value: number;
        current_value: number;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotPark {
        id?: number;
        community_id: number;
        name: string;
        secret: string;
        sign: string;
        verify_property_fee: typeof TRUE | typeof FALSE;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotParkBlacklist {
        id?: number;
        park_id: number;
        car_number: string;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotParkLog {
        id?: number;
        park_id: number;
        car_number: string;
        gate: string;
        is_leave: typeof TRUE | typeof FALSE;
        created_at: number;
    }

    interface IpmsIotWarning {
        id?: number;
        community_id: number;
        name: string;
        secret: string;
        sign: string;
        lng: number;
        lat: number;
        online: typeof TRUE | typeof FALSE;
        created_by: number;
        created_at: number;
    }

    interface IpmsIotWarningLog {
        id?: number;
        warning_id: number;
        building_id: number;
        category: typeof WARNING_OF_WATER | typeof WARNING_OF_FIRE | typeof WARNING_OF_GAS;
        created_at: number;
    }
}

export = IpmsModel;

declare module 'knex/types/tables' {
    export interface Tables {
        ipms_wechat_mp_user: IpmsModel.IpmsWechatMpUser;
        ipms_wechat_mp_auth: IpmsModel.IpmsWechatMpAuth;
        ipms_wechat_mp_user_login: IpmsModel.IpmsWechatMpUserLogin;
        ipms_wechat_official_accounts_user: IpmsModel.IpmsWechatOfficialAccountsUser;
        ipms_property_company_department: IpmsModel.IpmsPropertyCompanyDepartment;
        ipms_property_company_job: IpmsModel.IpmsPropertyCompanyJob;
        ipms_property_company_user: IpmsModel.IpmsPropertyCompanyUser;
        ipms_property_company_user_join_record: IpmsModel.IpmsPropertyCompanyUserJoinRecord;
        ipms_property_company_auth: IpmsModel.IpmsPropertyCompanyAuth;
        ipms_property_company_user_login: IpmsModel.IpmsPropertyCompanyUserLogin;
        ipms_property_company_user_default_community: IpmsModel.IpmsPropertyCompanyUserDefaultCommunity;
        ipms_property_company_user_access_community: IpmsModel.IpmsPropertyCompanyUserAccessCommunity;
        ipms_property_company_access: IpmsModel.IpmsPropertyCompanyAccess;
        ipms_property_company_building_registered: IpmsModel.IpmsPropertyCompanyBuildingRegistered;
        ipms_community_info: IpmsModel.IpmsCommunityInfo;
        ipms_community_setting: IpmsModel.IpmsCommunitySetting;
        ipms_community_remote_open_door_log: IpmsModel.IpmsCommunityRemoteOpenDoorLog;
        ipms_building_info: IpmsModel.IpmsBuildingInfo;
        ipms_user_building: IpmsModel.IpmsUserBuilding;
        ipms_user_building_operate_log: IpmsModel.IpmsUserBuildingOperateLog;
        ipms_user_default_community: IpmsModel.IpmsUserDefaultCommunity;
        ipms_user_car: IpmsModel.IpmsUserCar;
        ipms_user_car_operate_log: IpmsModel.IpmsUserCarOperateLog;
        ipms_user_car_sync: IpmsModel.IpmsUserCarSync;
        ipms_notice_to_user: IpmsModel.IpmsNoticeToUser;
        ipms_notice_to_user_readed: IpmsModel.IpmsNoticeToUserReaded;
        ipms_notice_tpl: IpmsModel.IpmsNoticeTpl;
        ipms_feedback: IpmsModel.IpmsFeedback;
        ipms_repair: IpmsModel.IpmsRepair;
        ipms_repair_urge: IpmsModel.IpmsRepairUrge;
        ipms_complain: IpmsModel.IpmsComplain;
        ipms_convenient: IpmsModel.IpmsConvenient;
        ipms_property_fee: IpmsModel.IpmsPropertyFee;
        ipms_property_fee_order: IpmsModel.IpmsPropertyFeeOrder;
        ipms_property_fee_order_item: IpmsModel.IpmsPropertyFeeOrderItem;
        ipms_pet: IpmsModel.IpmsPet;
        ipms_pet_vaccinate: IpmsModel.IpmsPetVaccinate;
        ipms_fitment: IpmsModel.IpmsFitment;
        ipms_move_car: IpmsModel.IpmsMoveCar;
        ipms_vistor: IpmsModel.IpmsVistor;
        ipms_schedule: IpmsModel.IpmsSchedule;
        ipms_questionnaire: IpmsModel.IpmsQuestionnaire;
        ipms_question: IpmsModel.IpmsQuestion;
        ipms_question_option: IpmsModel.IpmsQuestionOption;
        ipms_questionnaire_statistics: IpmsModel.IpmsQuestionnaireStatistics;
        ipms_questionnaire_answer: IpmsModel.IpmsQuestionnaireAnswer;
        ipms_questionnaire_answer_result: IpmsModel.IpmsQuestionnaireAnswerResult;
        ipms_topic: IpmsModel.IpmsTopic;
        ipms_session_store: IpmsModel.IpmsSessionStore;
        ipms_contract_category: IpmsModel.IpmsContractCategory;
        ipms_contract: IpmsModel.IpmsContract;
        ipms_contract_item: IpmsModel.IpmsContractItem;
        ipms_owner_apply: IpmsModel.IpmsOwerApply;
        ipms_owner_detail_log: IpmsModel.IpmsOwerDetailLog;
        ipms_workflow: IpmsModel.IpmsWorkflow;
        ipms_workflow_node: IpmsModel.IpmsWorkflowNode;
        ipms_ask_for_leave: IpmsModel.IpmsAskForLeave;
        ipms_ask_for_leave_flow: IpmsModel.IpmsAskForLeaveFlow;
        ipms_refound: IpmsModel.IpmsRefound;
        ipms_refound_flow: IpmsModel.IpmsRefoundFlow;
        ipms_refound_item: IpmsModel.IpmsRefoundItem;
        ipms_storehouse: IpmsModel.IpmsStorehouse;
        ipms_material_category: IpmsModel.IpmsMaterialCategory;
        ipms_material_supplier: IpmsModel.IpmsMaterialSupplier;
        ipms_material: IpmsModel.IpmsMaterial;
        ipms_material_used: IpmsModel.IpmsMaterialUsed;
        ipms_material_purchase: IpmsModel.IpmsMaterialPurchase;
        ipms_material_purchase_flow: IpmsModel.IpmsMaterialPurchaseFlow;
        ipms_material_purchase_item: IpmsModel.IpmsMaterialPurchaseItem;
        ipms_meeting_room: IpmsModel.IpmsMeetingRoom;
        ipms_meeting: IpmsModel.IpmsMeeting;
        ipms_meeting_participant: IpmsModel.IpmsMeetingParticipant;
        ipms_mission_point: IpmsModel.IpmsMissionPoint;
        ipms_mission_category: IpmsModel.IpmsMissionCategory;
        ipms_mission_line: IpmsModel.IpmsMissionLine;
        ipms_mission_line_node: IpmsModel.IpmsMissionLineNode;
        ipms_mission: IpmsModel.IpmsMission;
        ipms_mission_complete: IpmsModel.IpmsMissionComplete;
        ipms_mission_complete_node: IpmsModel.IpmsMissionCompleteNode;
        ipms_inform: IpmsModel.IpmsInform;
        ipms_party: IpmsModel.IpmsParty;
        ipms_employee_sign_setting: IpmsModel.IpmsEmployeeSignSetting;
        ipms_employee_sign_reocrd: IpmsModel.IpmsEmployeeSignRecord;
        ipms_iot_elevator: IpmsModel.IpmsIotElevator;
        ipms_iot_elevator_log: IpmsModel.IpmsIotElevatorLog;
        ipms_iot_entrance: IpmsModel.IpmsIotEntrance;
        ipms_iot_entrance_log: IpmsModel.IpmsIotEntranceLog;
        ipms_iot_lamp: IpmsModel.IpmsIotLamp;
        ipms_iot_lamp_line: IpmsModel.IpmsIotLampLine;
        ipms_iot_lamp_work_mode: IpmsModel.IpmsIotLampWorkMode;
        ipms_iot_lamp_log: IpmsModel.IpmsIotLampLog;
        ipms_iot_meter_repeater: IpmsModel.IpmsIotMeterRepeater;
        ipms_iot_meter: IpmsModel.IpmsIotMeter;
        ipms_iot_meter_read: IpmsModel.IpmsIotMeterRead;
        ipms_iot_park: IpmsModel.IpmsIotPark;
        ipms_iot_park_blacklist: IpmsModel.IpmsIotParkBlacklist;
        ipms_iot_park_log: IpmsModel.IpmsIotParkLog;
        ipms_iot_warning: IpmsModel.IpmsIotWarning;
        ipms_iot_warning_log: IpmsModel.IpmsIotWarningLog;
    }
}
