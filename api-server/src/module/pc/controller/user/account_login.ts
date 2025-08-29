/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, CAPTCHA_ERROR, PWD_ERROR } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as propertyCompanyService from '~/service/property_company';
import utils from '~/utils';

/**
 * 请求体接口定义
 * 定义用户登录时提交的数据结构
 */
interface RequestBody {
    account: string;    // 用户账号
    password: string;   // 用户密码
    captcha: string;    // 验证码
}

/**
 * PC端用户账号登录Action
 * 
 * Action是系统中路由处理的基本单元，包含三个核心部分：
 * 1. router: 定义路由信息（路径、HTTP方法、是否需要认证等）
 * 2. validator: 定义请求参数验证规则
 * 3. response: 定义具体的业务处理逻辑
 * 
 * 这个Action的作用：
 * - 接收用户的登录请求（账号、密码、验证码）
 * - 验证用户身份的合法性
 * - 生成登录token并记录登录日志
 * - 返回用户信息和岗位信息
 */
const PcUserAccountLoginAction = <Action>{
    router: {
        path: '/user/account_login',    // 登录接口路径
        method: 'post',                 // 使用POST方法，因为涉及敏感信息传输
        authRequired: false             // 不需要预先认证，因为这本身就是认证接口
    },
    validator: {
        body: [
            {
                name: 'account',
                required: true,     // 账号必填
                min: 4,            // 最小长度4位，防止过短账号
                max: 32            // 最大长度32位，防止恶意长字符串攻击
            },
            {
                name: 'password',
                required: true,     // 密码必填
                max: 32            // 限制密码长度，防止过长密码攻击
            },
            {
                name: 'captcha',
                required: true,     // 验证码必填
                length: 4          // 验证码固定4位，与生成的验证码长度保持一致
            }
        ]
    },
    response: async ctx => {
        const { account, password, captcha } = <RequestBody>ctx.request.body;

        // 验证码校验：防止暴力破解和机器人攻击
        // 从session中获取之前生成的验证码进行比较，不区分大小写
        if (!ctx.session.loginCaptcha || ctx.session.loginCaptcha !== captcha.toLowerCase()) {
            return (ctx.body = {
                code: CAPTCHA_ERROR,
                message: '验证码错误'
            });
        }

        // 验证码使用后立即销毁，防止重复使用（一次性验证码原则）
        delete ctx.session.loginCaptcha;

        // 查询用户信息：使用左连接获取完整的用户数据
        // 连接三个表：用户表、微信公众号用户表、权限表
        // 这样设计是为了在一次查询中获取用户的基本信息、微信绑定状态和权限信息
        let pcUserInfo = await ctx.model
            .table('ipms_property_company_user')
            .leftJoin(
                'ipms_wechat_official_accounts_user',
                'ipms_wechat_official_accounts_user.union_id',
                'ipms_property_company_user.union_id'
            )
            .leftJoin(
                'ipms_property_company_access',
                'ipms_property_company_access.id',
                'ipms_property_company_user.access_id'
            )
            .where('ipms_property_company_user.leave_office', FALSE)  // 只查询在职用户
            .where('ipms_property_company_user.account', account)     // 根据账号查询
            .select(
                'ipms_property_company_user.id',
                'ipms_property_company_user.account',
                'ipms_property_company_user.password',
                'ipms_property_company_user.open_id',
                'ipms_property_company_user.real_name',
                'ipms_property_company_user.gender',
                'ipms_property_company_user.avatar_url',
                'ipms_property_company_user.phone',
                'ipms_property_company_user.department_id',
                'ipms_property_company_user.job_id',
                'ipms_property_company_user.join_company_at',
                'ipms_property_company_user.admin',
                'ipms_property_company_user.created_at',
                'ipms_wechat_official_accounts_user.subscribed',
                'ipms_property_company_access.content'
            )
            .first();

        // 用户身份验证：检查用户是否存在且密码正确
        // 使用MD5加密密码进行比较，这里应该考虑使用更安全的加密方式如bcrypt
        if (!pcUserInfo || pcUserInfo.password !== utils.crypto.md5(password)) {
            return (ctx.body = {
                code: PWD_ERROR,
                message: '密码错误或账号不存在'
            });
        }

        // 生成登录token：使用openid和当前时间戳生成唯一token
        // 这样可以确保每次登录都有不同的token，提高安全性
        const token = utils.crypto.md5(`${pcUserInfo.openid}${Date.now()}`);

        // 数据脱敏：隐藏手机号中间部分，保护用户隐私
        pcUserInfo.phone = utils.phone.hide(pcUserInfo.phone);
        
        // 处理权限数据：确保权限字段始终是数组格式
        pcUserInfo.access = pcUserInfo.content ? pcUserInfo.content : [];

        // 清理敏感信息：删除不应该返回给前端的字段
        delete pcUserInfo.openid;      // openid是内部标识，不暴露给前端
        delete pcUserInfo.content;     // content已经转换为access，删除原字段
        delete pcUserInfo.password;    // 密码绝对不能返回给前端
        delete pcUserInfo.department_id; // 部门ID通过其他接口获取详细信息
        delete pcUserInfo.job_id;      // 岗位ID通过其他接口获取详细信息

        // 更新用户的登录token：将新token保存到认证表中
        // 这样下次请求时可以通过token验证用户身份
        await ctx.model
            .from('ipms_property_company_auth')
            .where({ property_company_user_id: pcUserInfo.id })
            .update({
                token
            });

        // 记录登录日志：用于安全审计和异常检测
        // 记录用户ID、IP地址、User-Agent和登录时间
        await ctx.model.from('ipms_property_company_user_login').insert({
            property_company_user_id: pcUserInfo.id,
            ip: ctx.request.ip,                    // 记录登录IP，用于安全监控
            user_agent: ctx.headers['user-agent'], // 记录浏览器信息，用于设备识别
            login_at: Date.now()                   // 记录登录时间戳
        });

        // 获取用户的岗位信息：包括部门、职位等详细信息
        // 这些信息在用户登录后的权限判断和界面显示中会用到
        const postInfo = await propertyCompanyService.postInfo(ctx.model, pcUserInfo.id);

        // 返回登录成功结果：包含token、用户信息和岗位信息
        ctx.body = {
            code: SUCCESS,
            data: {
                token,          // 登录凭证，前端需要在后续请求中携带
                userInfo: pcUserInfo,  // 用户基本信息
                postInfo        // 用户岗位信息
            }
        };
    }
};

export default PcUserAccountLoginAction;
