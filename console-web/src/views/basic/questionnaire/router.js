/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'questionnaire',
    meta: {
        title: '问卷调查',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'question',
        roles: [ROLES.WJDC]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部问卷',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.WJDC]
            },
            component: () => import('./list')
        },
        {
            path: 'create',
            meta: {
                title: '创建问卷',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.WJDC]
            },
            component: () => import('./create')
        },
        {
            path: 'update/:id',
            meta: {
                title: '修改问卷',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.WJDC]
            },
            component: () => import('./update')
        },
        {
            path: 'preview/:id',
            meta: {
                title: '问卷详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.WJDC]
            },
            component: () => import('./preview')
        }
    ]
};
