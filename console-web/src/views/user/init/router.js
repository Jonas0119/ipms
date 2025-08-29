/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

// 导入角色常量
const ROLES = require('@/constants/role');

// 导出系统初始化路由配置
module.exports = {
    path: 'init', // 路由路径
    meta: {
        title: '系统初始化', // 页面标题
        authRequired: false, // 不需要身份验证
        layout: null, // 不使用布局
        nav: false, // 不显示在导航中
        roles: [ROLES.ANYONE] // 允许任何人访问
    },
    component: () => import('./index') // 懒加载组件
};
