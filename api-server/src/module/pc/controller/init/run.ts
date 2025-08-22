/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, SYSTEMT_ALREADY_INIT } from '~/constant/code';
import config from '~/config';
import { TRUE, FALSE } from '~/constant/status';
import utils from '~/utils';

interface RequestBody {
    name: string;
    banner: string;
    province: string;
    city: string;
    district: string;
    service_phone: string;
    access_nfc: typeof TRUE | typeof FALSE;
    access_remote: typeof TRUE | typeof FALSE;
    access_qrcode: typeof TRUE | typeof FALSE;
    carport_max_car: number;
    fitment_pledge: typeof TRUE | typeof FALSE;
    // profile
    account: string;
    password: string;
    real_name: string;
    avatar_url: string;
    phone: string;
    idcard: string;
}

const PcInitRunAction = <Action>{
    router: {
        path: '/init/run',
        method: 'post',
        authRequired: false
    },
    validator: {
        body: [
            {
                name: 'name',
                required: true,
                max: 12
            },
            {
                name: 'banner',
                required: true,
                max: 200,
                validator: val => {
                    // 支持OSS格式: /community_banner/hash.ext
                    const ossPattern = /^\/community_banner\/[a-z0-9]{32}\.(jpg|jpeg|png)$/;
                    // 支持本地上传格式: http://localhost:6688/static/filename.ext
                    const localPattern = /^https?:\/\/.+\.(jpg|jpeg|png)$/;
                    return ossPattern.test(val) || localPattern.test(val);
                }
            },
            {
                name: 'province',
                required: true,
                max: 12
            },
            {
                name: 'city',
                required: true,
                max: 12
            },
            {
                name: 'district',
                required: true,
                max: 12
            },
            {
                name: 'service_phone',
                required: true,
                length: 11
            },
            {
                name: 'access_nfc',
                required: true,
                validator: val => [TRUE, FALSE].includes(val)
            },
            {
                name: 'access_remote',
                required: true,
                validator: val => [TRUE, FALSE].includes(val)
            },
            {
                name: 'access_qrcode',
                required: true,
                validator: val => [TRUE, FALSE].includes(val)
            },
            {
                name: 'carport_max_car',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'fitment_pledge',
                required: true,
                validator: val => [TRUE, FALSE].includes(val)
            },
            {
                name: 'account',
                required: true,
                min: 4,
                max: 32
            },
            {
                name: 'password',
                required: true,
                max: 32
            },
            {
                name: 'real_name',
                required: true,
                max: 8
            },
            {
                name: 'idcard',
                required: true,
                validator: val => utils.idcard.verify(val)
            },
            {
                name: 'avatar_url',
                required: true,
                max: 200,
                validator: val => {
                    // 支持OSS格式: /avatar/hash.ext 或 /avatar/default.ext
                    const ossPattern = /^\/avatar\/[a-z0-9]{32}|default\.(jpg|jpeg|png)$/;
                    // 支持本地上传格式: http://localhost:6688/static/filename.ext
                    const localPattern = /^https?:\/\/.+\.(jpg|jpeg|png)$/;
                    return ossPattern.test(val) || localPattern.test(val);
                }
            },
            {
                name: 'phone',
                required: true,
                regex: /^1\d{10}$/
            }
        ]
    },
    response: async ctx => {
        const {
            name,
            banner,
            province,
            city,
            district,
            service_phone,
            access_nfc,
            access_remote,
            access_qrcode,
            carport_max_car,
            fitment_pledge,
            account,
            password,
            real_name,
            idcard,
            avatar_url,
            phone
        } = <RequestBody>ctx.request.body;

        const total = utils.sql.countReader(
            await ctx.model
                .from('ipms_property_company_user')
                .where('admin', TRUE)
                .count()
        );

        if (total > 0) {
            return (ctx.body = {
                code: SYSTEMT_ALREADY_INIT,
                message: '系统已经初始化'
            });
        }

        const created_at = Date.now();

        const [user_id] = await ctx.model.from('ipms_property_company_user').insert({
            account,
            password: utils.crypto.md5(password),
            real_name,
            idcard,
            gender: utils.idcard.gender(idcard),
            avatar_url,
            phone,
            admin: TRUE,
            join_company_at: created_at,
            created_at,
            leave_office: FALSE
        });

        const [community_id] = await ctx.model.from('ipms_community_info').insert({
            name,
            banner,
            province,
            city,
            district,
            phone: service_phone,
            created_at,
            created_by: user_id
        });

        await ctx.model.from('ipms_community_setting').insert({
            access_nfc,
            access_remote,
            access_qrcode,
            carport_max_car,
            fitment_pledge,
            community_id
        });

        await ctx.model.from('ipms_property_company_user_access_community').insert({
            community_id,
            property_company_user_id: user_id
        });

        await ctx.model.from('ipms_property_company_auth').insert({
            property_company_user_id: user_id,
            token: null
        });

        config.inited = true;

        ctx.body = {
            code: SUCCESS,
            message: '系统初始化成功'
        };
    }
};

export default PcInitRunAction;
