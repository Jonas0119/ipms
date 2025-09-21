/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

<template>
    <div class="location-picker">
        <div class="map" ref="map" />

        <Spin size="large" fix v-if="fetching || loading" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Spin } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import * as utils from '@/utils';
import mapConfigManager from '@/utils/map-manager';

export default {
    name: 'LocationPicker',
    mixins: [Emitter],
    props: {
        value: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            fetching: true,
            loading: true,
            center: []
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getCenter();
        }
    },
    async created() {
        try {
            console.log('[MAP-DEBUG] 开始加载腾讯地图，从后端获取配置...');
            
            // 从后端获取地图配置
            const mapConfig = await mapConfigManager.getMapConfig();
            console.log('[MAP-DEBUG] 地图配置获取成功:', mapConfig);
            
            // 检查地图配置是否有效
            if (!mapConfig.key || mapConfig.key === '' || mapConfig.key.length < 10) {
                console.error('[MAP-DEBUG] 地图API Key无效或未配置，地图将无法正常显示');
                this.loading = false;
                return;
            }
            
            this.script = document.createElement('script');
            this.script.type = 'text/javascript';
            
            // 使用配置管理器构建API脚本URL
            this.script.src = await mapConfigManager.buildMapScriptUrl({
                callback: 'initMap'
            });
            
            console.log('[MAP-DEBUG] 地图API脚本URL:', this.script.src);
            
            // 添加错误处理
            this.script.onerror = () => {
                console.error('[MAP-DEBUG] 腾讯地图脚本加载失败，请检查API Key是否正确');
                this.loading = false;
            };
            
            document.head.appendChild(this.script);
            window.initMap = this.initMap;
            
        } catch (error) {
            console.error('[MAP-DEBUG] 获取地图配置失败:', error);
            this.loading = false;
        }
    },
    beforeDestroy() {
        document.head.removeChild(this.script);
        this.map = null;
        this.marker = null;
    },
    methods: {
        getCenter() {
            const data = {
                community_id: this.postInfo.default_community_id
            };

            console.log('[MAP-DEBUG] 获取社区中心位置，community_id:', this.postInfo.default_community_id);
            this.fetching = false;
            utils.request
                .post('/option/location', data)
                .then(res => {
                    console.log('[MAP-DEBUG] 获取社区位置响应:', res.data);
                    this.fetching = false;
                    this.center = [
                        res.data.lat ? res.data.lat : res.data.location.lat,
                        res.data.lng ? res.data.lng : res.data.location.lng
                    ];

                    console.log('[MAP-DEBUG] 设置地图中心位置:', this.center);

                    if (this.map) {
                        this.map.setCenter(
                            new window.qq.maps.LatLng(
                                res.data.lat ? res.data.lat : res.data.location.lat,
                                res.data.lng ? res.data.lng : res.data.location.lng
                            )
                        );
                    }
                })
                .catch(err => {
                    console.error('[MAP-DEBUG] 获取社区位置失败:', err);
                    this.fetching = false;
                });
        },
        initMap() {
            console.log('[MAP-DEBUG] 初始化腾讯地图');
            this.marker = null;
            this.map = new window.qq.maps.Map(this.$refs.map, {
                backgroundColor: '#f7f7f7',
                zoom: 18,
                mapTypeControl: false,
                draggableCursor: 'crosshair'
            });

            console.log('[MAP-DEBUG] 地图初始化完成');

            window.qq.maps.event.addListener(this.map, 'click', e => {
                const lng = e.latLng.getLng();
                const lat = e.latLng.getLat();

                console.log('[MAP-DEBUG] 地图点击位置:', { lat, lng });

                this.$emit('input', [lat, lng]);
                this.$emit('on-change', [lat, lng]);
                this.dispatch('FormItem', 'on-form-change', [lat, lng]);

                this.setMarker();
            });

            if (this.value[0] && this.value[1]) {
                console.log('[MAP-DEBUG] 使用传入的坐标设置地图中心:', this.value);
                this.map.setCenter(new window.qq.maps.LatLng(this.value[0], this.value[1]));
                this.setMarker();
            } else if (this.center[0] && this.center[1]) {
                console.log('[MAP-DEBUG] 使用社区中心坐标设置地图中心:', this.center);
                this.map.setCenter(new window.qq.maps.LatLng(this.center[0], this.center[1]));
            } else {
                console.warn('[MAP-DEBUG] 没有可用的坐标设置地图中心');
            }

            this.loading = false;
        },
        setMarker() {
            const latlng = new window.qq.maps.LatLng(this.value[0], this.value[1]);

            if (!this.marker) {
                this.marker = new window.qq.maps.Marker({
                    position: latlng,
                    map: this.map
                });
            } else {
                this.marker.setPosition(latlng);
            }
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        })
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getCenter();
        },
        value(cur) {
            if (!this.map) return;

            if (cur[0] && cur[1]) {
                this.map.setCenter(new window.qq.maps.LatLng(cur[0], cur[1]));
                this.setMarker();
            } else {
                if (this.center[0] && this.center[1]) {
                    this.map.setCenter(new window.qq.maps.LatLng(this.center[0], this.center[1]));
                }

                if (this.marker) {
                    this.marker.setMap(null);
                    this.marker = null;
                }
            }
        }
    },
    components: {
        Spin
    }
};
</script>

<style lang="less">
.location-picker {
    width: 100%;
    height: 260px;
    position: relative;
    overflow: hidden;

    .map {
        width: 100%;
        height: 100%;
    }
}
</style>
