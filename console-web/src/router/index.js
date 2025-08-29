/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

// 导入Vue及相关依赖
import Vue from 'vue';
import VueRouter from 'vue-router';
import { LoadingBar } from 'view-design';
import * as utils from '@/utils';
import * as config from '@/config';

// 使用VueRouter插件
Vue.use(VueRouter);

// 保存原始的路由方法，用于处理路由跳转错误
const originalPush = VueRouter.prototype.push;
const originalReplace = VueRouter.prototype.replace;

// 重写push方法，捕获路由跳转错误，避免控制台报错
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};

// 重写replace方法，捕获路由跳转错误，避免控制台报错
VueRouter.prototype.replace = function replace(location) {
    return originalReplace.call(this, location).catch(err => err);
};

// 导出路由配置数组，包含各个模块的路由
export const routes = [
    require('@/views/home/router'),      // 首页相关路由
    require('@/views/user/router'),      // 用户管理路由
    require('@/views/basic/router'),     // 基础信息路由
    require('@/views/iot/router'),       // 物联网设备路由
    require('@/views/oa/router'),        // 办公自动化路由
    require('@/views/statistic/router'), // 统计报表路由
    require('@/views/setting/router'),   // 系统设置路由
    require('@/views/print/router'),     // 打印功能路由
    require('@/views/404/router')        // 404错误页面路由
];

// 创建路由实例，使用history模式
const router = new VueRouter({
    mode: 'history',
    routes
});

// 路由前置守卫，处理页面标题和权限验证
router.beforeEach((to, from, next) => {
    // 收集路由层级中的标题信息
    const titles = [];

    // 遍历匹配的路由，提取meta中的title
    to.matched.forEach(({ meta }) => titles.push(meta.title));

    // 设置页面标题，将路由标题倒序拼接
    document.title = `${titles.reverse().join('-')} | ${config.SITE_TITLE} `;
    
    // 开始显示页面加载进度条
    LoadingBar.start();
    
    // 检查路由是否需要登录权限
    if (to.meta.authRequired && !utils.auth.isLogin()) {
        // 未登录且需要权限，跳转到登录页面，并记录重定向地址
        next({
            path: '/user/login',
            query: {
                redirect: to.path
            }
        });
    } else {
        // 有权限或不需要权限，继续路由跳转
        next();
    }
});

// 路由后置守卫，处理页面加载完成后的操作
router.afterEach(() => {
    // 结束页面加载进度条
    LoadingBar.finish();
});

// 导出路由实例
export default router;
