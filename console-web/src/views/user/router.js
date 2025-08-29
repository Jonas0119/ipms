/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

// 导入角色常量，用于权限控制
const ROLES = require('@/constants/role');

// 用户模块路由配置
// 主要包含用户相关的页面：系统初始化、登录、区域选择等
module.exports = {
    path: '/user',                    // 用户模块基础路径
    meta: {
        authRequired: false,          // 不需要登录认证（因为包含登录页面本身）
        title: '用户',                // 页面标题
        layout: null,                 // 不使用默认布局（用户页面通常有独立的布局）
        nav: false,                   // 不显示在导航菜单中
        roles: [ROLES.ANYONE]         // 允许任何人访问（包括未登录用户）
    },
    component: () => import('./'),    // 懒加载用户模块的主组件
    children: [
        require('./init/router'),     // 系统初始化页面路由
        require('./login/router'),    // 用户登录页面路由
        require('./zone/router')      // 区域选择页面路由
    ]
};
