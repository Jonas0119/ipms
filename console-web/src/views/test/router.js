/**
 * 测试模块路由配置
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'test',
    meta: {
        title: '测试模块',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'tool',
        roles: [ROLES.ANYONE] // 任何登录用户都可以访问
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '测试首页',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '测试详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./detail')
        }
    ]
};
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          

