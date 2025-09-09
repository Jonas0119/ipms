/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

<template>
    <!-- 应用主容器，使用section标签包裹整个应用 -->
    <section id="app">
        <!-- 音频元素，用于播放通知声音，预加载音频文件且隐藏控件 -->
        <audio ref="audio" preload="auto" hidden>
            <!-- 音频源文件，格式为mp3 -->
            <source src="../../assets/notice.mp3" type="audio/mpeg" />
        </audio>
        <!-- 主布局容器，当布局类型为侧边栏时显示 -->
        <Layout v-if="layout === 'sider'" class="cw-layout">
            <!-- 左侧边栏，宽度216px，支持折叠功能 -->
            <Sider
                :width="216"
                v-model="settings.siderCollapsed"
                :class="siderClasses"
                hide-trigger
                collapsible
                v-show="mediaQuery !== 'xs'"
                :collapsed-width="80"
            >
                <!-- 导航组件，传入相关配置和用户信息 -->
                <Nav
                    :siderCollapsed="settings.siderCollapsed"
                    :theme="settings.siderTheme"
                    :settings="settings"
                    :userInfo="userInfo"
                />
            </Sider>

            <!-- 内容区域布局容器 -->
            <Layout :class="contentLayoutClasses">
                <!-- 顶部头部区域 -->
                <Header :class="headerClasses">
                    <!-- 顶部工具栏组件，包含各种功能按钮和用户信息 -->
                    <Topbar
                        :siderCollapsed="settings.siderCollapsed"
                        :theme="settings.headerTheme"
                        :settings="settings"
                        :mediaQuery="mediaQuery"
                        :updateSettings="this.updateSettings"
                        :mobileMenuVisible="mobileMenuVisible"
                        :updateMobileMenuVisible="this.updateMobileMenuVisible"
                        :userInfo="userInfo"
                        :postInfo="postInfo"
                        v-model="settingVisible"
                    />
                </Header>

                <!-- 主内容区域，用于显示路由组件 -->
                <Content :class="contentClasses">
                    <!-- 路由视图，显示当前路由对应的组件 -->
                    <router-view />
                </Content>

                <!-- 底部区域 -->
                <Footer>
                    <!-- 版权信息组件 -->
                    <Copyright />
                </Footer>
            </Layout>

            <!-- 移动端菜单抽屉，只在小屏设备上显示 -->
            <Drawer
                :closable="false"
                v-model="mobileMenuVisible"
                v-show="mediaQuery === 'xs'"
                placement="left"
                transfer
                :class="mobileMenuClasses"
            >
                <!-- 移动端导航菜单 -->
                <Nav :siderCollapsed="false" :theme="settings.siderTheme" :settings="settings" :userInfo="userInfo" />
            </Drawer>

            <!-- 设置面板组件 -->
            <Setting v-model="settingVisible" :settings="settings" :updateSettings="this.updateSettings" />
        </Layout>
        <!-- 当布局不是侧边栏类型时，直接显示路由视图 -->
        <router-view v-else />
    </section>
</template>

<script>
// 导入Vuex的mapActions和mapGetters辅助函数
import { mapActions, mapGetters } from 'vuex';
// 导入iView UI组件库的布局相关组件
import { Layout, Sider, Header, Content, Drawer, Notice } from 'view-design';
// 导入自定义组件
import Nav from './components/nav';
import Topbar from './components/topbar';
import Setting from './components/setting';
import Copyright from './components/copyright';
// 导入设置配置和保存设置的方法
import settings, { save as saveSettings } from './settings';
// 导入工具函数
import * as utils from '@/utils';
// 导入角色常量
import ROLES from '@/constants/role';

export default {
    name: 'App', // 组件名称
    data() {
        return {
            settingVisible: false, // 设置面板是否可见
            mobileMenuVisible: false, // 移动端菜单是否可见
            mediaQuery: this.computedMediaQuery(), // 当前媒体查询状态
            settings, // 应用设置
            socketConnected: false // WebSocket连接状态
        };
    },
    mounted() {
        // 组件挂载后添加窗口大小变化监听器
        window.addEventListener('resize', this.onResize, false);
    },
    destroy() {
        // 组件销毁时移除事件监听器，防止内存泄漏
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        // 映射Vuex的actions到组件方法
        ...mapActions({
            fetchUserInfo: 'common/fetchUserInfo', // 获取用户信息
            pushUnreadNotices: 'common/pushUnreadNotices' // 推送未读通知
        }),
        // 计算当前屏幕尺寸对应的媒体查询类型
        computedMediaQuery() {
            const { innerWidth: width } = window;

            // 根据屏幕宽度返回对应的尺寸标识
            if (width >= 1600) {
                return 'xxl'; // 超大屏
            } else if (width >= 1200 && width < 1600) {
                return 'xl'; // 大屏
            } else if (width >= 992 && width < 1200) {
                return 'lg'; // 中大屏
            } else if (width >= 768 && width < 992) {
                return 'md'; // 中屏
            } else if (width >= 576 && width < 768) {
                return 'sm'; // 小屏
            } else {
                return 'xs'; // 超小屏
            }
        },
        // 窗口大小变化时的处理函数
        onResize() {
            // 重新计算媒体查询状态
            this.mediaQuery = this.computedMediaQuery();
        },
        // 更新设置的方法
        updateSettings(key, val) {
            // 保存设置到本地存储
            saveSettings(key, val);
            // 更新组件内的设置数据
            this.settings[key] = val;
        },
        // 切换移动端菜单显示状态
        updateMobileMenuVisible() {
            this.mobileMenuVisible = !this.mobileMenuVisible;
        },
        // 建立WebSocket连接用于实时通知（与后端 /cws 保持一致）
        connect() {
            // 创建WebSocket连接，根据当前协议选择ws或wss
            // 统一 WS 入口：/cws，并通过 token 完成鉴权（见 api-server/src/wss/index.ts）
            const token = utils.auth.getToken();
            console.log('🔗 [WEBSOCKET-DEBUG] Attempting to connect...');
            console.log('🔗 [WEBSOCKET-DEBUG] Token for WebSocket:', token ? token.substring(0, 10) + '...' : 'undefined');
            console.log('🔗 [WEBSOCKET-DEBUG] Is logged in:', utils.auth.isLogin());
            
            const wsUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/cws?token=${token}`;
            console.log('🔗 [WEBSOCKET-DEBUG] WebSocket URL:', wsUrl);
            
            const ws = new WebSocket(wsUrl);
            let timer = null; // 心跳检测定时器
            
            // 心跳检测函数，每3秒发送一次ping
            const heartCheck = () => {
                timer = setTimeout(() => {
                    ws.send('ping'); // 发送心跳包
                    heartCheck(); // 递归调用保持心跳
                }, 3000);
            };

            // WebSocket连接成功时启动心跳检测
            ws.onopen = () => {
                console.log('🔗 [WEBSOCKET-DEBUG] WebSocket connection opened successfully');
                heartCheck();
            };

            // 接收到WebSocket消息时的处理（PcData 结构，见 wss/index.ts）
            ws.onmessage = e => {
                // 解析接收到的JSON数据
                const { type, id, community_id, urge } = JSON.parse(e.data);

                // 只提示与当前岗位默认社区相关的消息
                if (this.postInfo.default_community_id !== community_id) {
                    return;
                }

                let title = null; // 通知标题
                let desc = null; // 通知描述
                let route = null; // 跳转路由
                const uuid = `${Date.now()}${id}${type}`; // 生成唯一标识

                // 根据消息类型设置不同的通知内容
                switch (type) {
                    case ROLES.WXWF: // 维修维护
                        title = urge ? '工单催促' : '维修维护';
                        desc = urge ? '业主催促工单进度了，请尽快处理' : '业主提交了新的工单，请尽快响应';
                        route = 'repair';
                        break;

                    case ROLES.TSJY: // 投诉建议
                        title = '投诉建议';
                        desc = '业主提交了投诉建议，请尽快回复';
                        route = 'complain';
                        break;

                    case ROLES.ZXDJ: // 装修登记
                        title = '装修登记';
                        desc = '业主提交了装修登记，请尽快处理';
                        route = 'fitment';
                        break;

                    case ROLES.XQNC: // 小区挪车
                        title = '小区挪车';
                        desc = '业主的车被堵住了，快协助车主联系一下吧';
                        route = 'movecar';
                        break;
                }

                // 播放提示音（静默失败）
                try {
                    this.$refs.audio.play();
                } catch (e) {
                    // 播放失败时不做任何处理
                }

                // 显示通知，创建可点击的通知项
                Notice.info({
                    duration: 0, // 不自动消失
                    title,
                    name: uuid, // 用于关闭特定通知
                    render: h =>
                        h(
                            'a', // 渲染为链接元素
                            {
                                on: {
                                    click: () => {
                                        // 点击时跳转到详情页面
                                        this.$router.push(`/basic/${route}/detail/${id}`);
                                        // 关闭当前通知
                                        Notice.close(uuid);
                                    }
                                }
                            },
                            desc // 显示描述文本
                        )
                });

                // 清除旧的心跳定时器并重新启动
                clearTimeout(timer);
                heartCheck();
            };

            // WebSocket连接关闭时的处理
            ws.onclose = e => {
                // 如果不是正常关闭（代码1000）或无状态关闭（代码1005），则重新连接
                if (e.code !== 1000 && e.code !== 1005) {
                    this.connect();
                }
            };

            // 页面关闭前关闭WebSocket连接（释放心跳定时器与连接）
            window.onbeforeunload = () => {
                ws.close();
            };
        }
    },
    computed: {
        // 映射Vuex的getters到组件的计算属性
        ...mapGetters({
            userInfo: 'common/userInfo', // 用户信息
            postInfo: 'common/postInfo' // 岗位信息
        }),
        // 获取当前路由的布局类型
        layout() {
            return this.$route.meta.layout;
        },
        // 侧边栏的CSS类名
        siderClasses() {
            const { siderTheme, siderFixed } = this.settings;

            return {
                'cw-layout-sider': true, // 基础类名
                [`cw-layout-sider-${siderTheme}`]: true, // 主题类名
                'cw-layout-sider-fixed': siderFixed // 固定定位类名
            };
        },
        // 头部的CSS类名
        headerClasses() {
            const { headerTheme, headerFixed, siderCollapsed } = this.settings;

            return {
                'cw-layout-header': true, // 基础类名
                'cw-layout-header-fixed': headerFixed, // 固定定位
                'cw-layout-header-fixed-collapsed': headerFixed && siderCollapsed, // 固定且侧边栏折叠
                'cw-layout-header-fixed-mobile': headerFixed && this.mediaQuery === 'xs', // 移动端固定
                [`cw-layout-header-${headerTheme}`]: true // 主题类名
            };
        },
        // 内容布局的CSS类名
        contentLayoutClasses() {
            const { siderFixed, siderCollapsed } = this.settings;

            return {
                // 非移动端且侧边栏固定时的布局类名
                'cw-layout-content-layout': siderFixed && this.mediaQuery !== 'xs',
                // 侧边栏折叠时的布局类名
                'cw-layout-content-layout-collapsed': siderFixed && siderCollapsed && this.mediaQuery !== 'xs'
            };
        },
        // 内容区域的CSS类名
        contentClasses() {
            const { headerFixed } = this.settings;

            return {
                'cw-layout-content': true, // 基础类名
                'cw-layout-content-fill': headerFixed // 头部固定时的填充类名
            };
        },
        // 移动端菜单的CSS类名
        mobileMenuClasses() {
            const { siderTheme } = this.settings;

            return {
                'cw-layout-mobile-menu': true, // 基础类名
                [`cw-layout-mobile-menu-${siderTheme}`]: true // 主题类名（注意这里有拼写错误mobile写成了moible）
            };
        }
    },
    // 注册组件
    components: {
        Layout, // 布局组件
        Sider, // 侧边栏组件
        Header, // 头部组件
        Content, // 内容组件
        Nav, // 导航组件
        Topbar, // 顶部工具栏组件
        Drawer, // 抽屉组件
        Setting, // 设置组件
        Copyright // 版权组件
    },
    // 监听器
    watch: {
        // 监听路由变化
        $route(cur, old) {
            // 移动端路由变化时关闭菜单
            if (this.mediaQuery === 'xs' && cur.path !== old.path) {
                this.mobileMenuVisible = false;
            }

            // 用户未登录但路由需要认证时获取用户信息
            if (this.userInfo.id === undefined && cur.meta.authRequired) {
                this.fetchUserInfo();
            }

            // 用户无权限访问时退出登录
            if (this.userInfo.id && cur.meta.accessRequired && !this.postInfo.job && !this.postInfo.is_admin) {
                utils.auth.logout();
                this.$router.replace('/login');
            }
        },
        // 监听用户ID变化后建立 WS（仅在已登录且有权限时）
        'userInfo.id'(cur) {
            console.log('🔗 [WEBSOCKET-DEBUG] User ID changed, current value:', cur);
            console.log('🔗 [WEBSOCKET-DEBUG] User access length:', this.userInfo.access?.length);
            console.log('🔗 [WEBSOCKET-DEBUG] Socket already connected:', this.socketConnected);
            console.log('🔗 [WEBSOCKET-DEBUG] Current token when user ID changed:', utils.auth.getToken() ? 'exists' : 'missing');
            
            // 如果用户未登录、无权限或已连接WebSocket则返回
            if (!cur || !this.userInfo.access.length === 0 || this.socketConnected) {
                console.log('🔗 [WEBSOCKET-DEBUG] Conditions not met for WebSocket connection');
                return;
            }

            console.log('🔗 [WEBSOCKET-DEBUG] All conditions met, establishing WebSocket connection...');
            // 标记WebSocket已连接并建立连接
            this.socketConnected = true;
            this.connect();
        }
    }
};
</script>

<style lang="less">
/* 设置页面基础高度为100% */
#app,
body,
html,
.cw-layout {
    height: 100%;
}

.cw-layout {
    // 侧边栏样式
    &-sider {
        min-height: 100vh; /* 最小高度为视口高度 */
        z-index: 13; /* 层级设置 */

        /* 浅色主题侧边栏阴影 */
        &-light {
            box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
        }

        /* 深色主题侧边栏样式 */
        &-dark {
            background: #191a23 !important; /* 深色背景 */
            box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35); /* 深色阴影 */
        }

        /* 固定定位的侧边栏 */
        &-fixed {
            position: fixed !important;
            top: 0;
            left: 0;
        }
    }

    // 头部样式
    &-header {
        transition: all 0.2s ease-in-out; /* 过渡动画 */
        z-index: 11; /* 层级设置 */

        /* 固定定位的头部 */
        &-fixed {
            position: fixed;
            top: 0;
            right: 0;
            left: 216px; /* 默认左边距为侧边栏宽度 */

            /* 侧边栏折叠时的左边距 */
            &-collapsed {
                left: 80px;
            }

            /* 移动端时的左边距 */
            &-mobile {
                left: 0;
            }
        }

        /* 浅色主题头部阴影 */
        &-light {
            box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
        }

        /* 深色主题头部背景 */
        &-dark {
            background: #191a23 !important;
        }

        /* 主色调主题头部渐变背景 */
        &-primary {
            background: linear-gradient(90deg, #1d42ab, #2173dc, #1e93ff) !important;
        }
    }

    // 内容布局样式
    &-content-layout {
        transition: all 0.2s ease-in; /* 过渡动画 */
        padding-left: 216px; /* 默认左内边距为侧边栏宽度 */

        /* 侧边栏折叠时的左内边距 */
        &-collapsed {
            padding-left: 80px;
        }
    }

    // 移动端菜单样式
    &-mobile-menu {
        width: 216px; /* 菜单宽度 */

        /* 抽屉内容区域无内边距 */
        .ivu-drawer-body {
            padding: 0;
        }

        /* 浅色主题移动端菜单背景 */
        &-light {
            .ivu-drawer-content {
                background: #fff;
            }
        }

        /* 深色主题移动端菜单背景 */
        &-dark {
            .ivu-drawer-content {
                background: #191a23;
            }
        }
    }

    // 内容区域样式
    &-content {
        padding: 26px 26px 0; /* 默认内边距 */
        position: relative; /* 相对定位 */

        /* 头部固定时的上内边距 */
        &-fill {
            padding-top: 89px !important;
        }
    }
}

/* 小屏设备媒体查询 */
@media screen and (max-width: 586px) {
    .cw-layout {
        /* 移动端内容区域减少内边距 */
        &-content {
            padding: 12px;
        }
    }
}
</style>
