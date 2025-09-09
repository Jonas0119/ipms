/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const tabMap = [
    'pages/home/index',
    // 'pages/neighbor/index',
    'pages/service/index',
    'pages/zone/index'
];

Component({
    data: {
        activeTab: 0
    },
    methods: {
        onTabChange(e) {
            wx.switchTab({
                url: `/${tabMap[e.detail]}`
            });
        }
    }
});
