/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

// 导入Vue框架核心库
import Vue from 'vue';
// 导入应用主组件
import App from '@/views/app';
// 导入Vue懒加载插件，用于图片懒加载优化
import VueLazyload from 'vue-lazyload';
// 导入拖拽组件库
import VueDND from 'awe-dnd';
// 导入时间处理库
import moment from 'moment';
// 导入路由配置
import router from '@/router';
// 导入Vuex状态管理
import store from '@/store';
// 导入工具函数集合
import * as utils from '@/utils';
// 导入全局样式主题文件
import '@/styles/theme.less';

// 关闭Vue生产环境提示
Vue.config.productionTip = false;

// 配置moment.js中文本地化设置
moment.updateLocale('en', {
    invalidDate: '未知日期' // 设置无效日期的显示文本
});

// 注册全局过滤器：格式化时间显示
Vue.filter('mom_format', (mom, withTime = true) => {
    // 如果不显示时间，只返回日期部分
    if (!withTime) {
        return moment(mom).format('YYYY-MM-DD');
    }

    // 返回完整的日期时间格式
    return moment(mom).format('YYYY-MM-DD HH:mm:ss');
});

// 注册全局过滤器：格式化文件大小显示
Vue.filter('file_format', size => {
    return utils.file.size(size);
});

// 注册全局过滤器：格式化楼栋信息显示
Vue.filter('building', (obj, withType = true) => {
    return utils.building.text(obj, withType);
});

// 注册全局过滤器：格式化金额显示（人民币）
Vue.filter('yuan', num => {
    return utils.payment.yuan(num);
});

// 使用Vue懒加载插件，配置图片加载参数
Vue.use(VueLazyload, {
    preLoad: 1.3, // 预加载高度比例
    loading: require('@/assets/loading.svg'), // 加载中显示的图片
    attempt: 1 // 尝试加载次数
});

// 使用拖拽功能插件
Vue.use(VueDND);

// 创建根实例：路由守卫在 router/index.js 中，状态在 store 中
// 这里是前端应用的真正启动点（入口 index.html 中的 #app 挂载）
new Vue({
    router, // 注入路由
    store,  // 注入状态管理
    render: h => h(App) // 渲染主应用组件
}).$mount('#app'); // 挂载到id为app的DOM元素
