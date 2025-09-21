/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

<template>
    <section class="card map" ref="map"></section>
</template>

<script>
import mapConfigManager from '@/utils/map-manager';

export default {
    name: 'MapChart',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {
                    center: {},
                    entrance: [],
                    elevator: [],
                    lamp: [],
                    repeater: [],
                    park: [],
                    warning: []
                };
            }
        },
        log: {
            type: Object,
            default: () => {
                return {
                    entrance: [],
                    elevator: [],
                    lamp: [],
                    repeater: [],
                    park: [],
                    warning: []
                };
            }
        }
    },
    async created() {
        try {
            console.log('[MAP-DEBUG] 智慧大屏开始加载腾讯地图，从后端获取配置...');
            
            // 从后端获取地图配置
            const mapConfig = await mapConfigManager.getMapConfig();
            console.log('[MAP-DEBUG] 智慧大屏地图配置获取成功:', mapConfig);
            
            // 检查地图配置是否有效
            if (!mapConfig.key || mapConfig.key === '' || mapConfig.key.length < 10) {
                console.error('[MAP-DEBUG] 智慧大屏地图API Key无效或未配置，地图将无法正常显示');
                return;
            }
            
            this.script = document.createElement('script');
            this.script.type = 'text/javascript';
            
            // 使用配置管理器构建GL API脚本URL
            this.script.src = await mapConfigManager.buildMapGlScriptUrl({
                callback: 'initMap'
            });
            
            console.log('[MAP-DEBUG] 智慧大屏地图API脚本URL:', this.script.src);
            
            document.head.appendChild(this.script);
            window.initMap = this.initMap;
            
        } catch (error) {
            console.error('[MAP-DEBUG] 智慧大屏获取地图配置失败:', error);
        }
    },
    beforeDestroy() {
        document.head.removeChild(this.script);
        this.map = null;
    },
    methods: {
        initMap() {
            console.log('[MAP-DEBUG] 智慧大屏初始化腾讯地图');
            this.arc = null;
            this.map = new window.TMap.Map(this.$refs.map, {
                zoom: 19,
                mapStyleId: 'style3',
                pitch: 50,
                showControl: false
            });

            console.log('[MAP-DEBUG] 智慧大屏地图初始化完成');
            document.querySelector('.logo-text').parentElement.style = 'display: none!important;';

            this.resetMap();
        },
        resetMap() {
            console.log('[MAP-DEBUG] 智慧大屏重置地图，detail.center:', this.detail.center);
            
            if (!this.detail.center.lat || !this.detail.center.lng || !this.map) {
                console.warn('[MAP-DEBUG] 智慧大屏缺少必要的地图数据或地图未初始化');
                return;
            }

            console.log('[MAP-DEBUG] 智慧大屏设置地图中心:', { lat: this.detail.center.lat, lng: this.detail.center.lng });
            this.map.setCenter(new window.TMap.LatLng(this.detail.center.lat, this.detail.center.lng));

            if (this.arc) {
                this.arc.remove();
                this.dot.remove();
                this.radiationCircle.remove();
                this.heat.remove();
            }

            const lineData = [];
            const dotData = [];
            const radiationCircle = [];
            const heatData = {};

            for (let tp in this.detail) {
                if (tp === 'center') {
                    continue;
                }

                this.detail[tp].forEach(item => {
                    if (item.lat && item.lng) {
                        lineData.push({
                            id: tp,
                            from: { lat: item.lat, lng: item.lng },
                            to: { lat: this.detail.center.lat, lng: this.detail.center.lng }
                        });

                        dotData.push({ lat: item.lat, lng: item.lng });
                        radiationCircle.push({
                            radius: 5,
                            center: new window.TMap.LatLng(item.lat, item.lng)
                        });

                        if (!(tp in heatData)) {
                            heatData[tp] = {
                                lat: item.lat,
                                lng: item.lng,
                                count: this.log[tp].length
                            };
                        }
                    }
                });
            }

            if (lineData.length === 0) return;

            this.arc = new window.TMap.visualization.Arc({
                mode: 'vertical',
                enableBloom: true,
                zIndex: 2,
                processAnimation: {
                    tailFactor: 0.6
                },
                pickStyle: arcLine => {
                    const baseStyle = {
                        color: 'rgba(1,124,247,0.1)',
                        width: 3
                    };

                    switch (arcLine.id) {
                        case 'entrance':
                            return {
                                ...baseStyle,
                                animateColor: '#eb2f96'
                            };

                        case 'elevator':
                            return {
                                ...baseStyle,
                                animateColor: '#1890ff'
                            };

                        case 'lamp':
                            return {
                                ...baseStyle,
                                animateColor: '#13c2c2'
                            };

                        case 'repeater':
                            return {
                                ...baseStyle,
                                animateColor: '#52c41a'
                            };

                        case 'park':
                            return {
                                ...baseStyle,
                                animateColor: '#722ed1'
                            };

                        case 'warning':
                            return {
                                ...baseStyle,
                                animateColor: '#ed4014'
                            };
                    }
                }
            })
                .addTo(this.map)
                .setData(lineData);

            this.radiationCircle = new window.TMap.visualization.Radiation({
                styles: {
                    default: {
                        fillColor: 'rgba(0,0,0,0)', // 辐射圈填充颜色
                        strokeColor: '#FFF', // 辐射圈边线颜色
                        strokeWidth: 2 //	区域边线宽度
                    }
                },
                zIndex: 3,
                number: 2 // 每一时刻，辐射圈的同心圆个数
            })
                .addTo(this.map)
                .setData(radiationCircle);

            //初始化散点图
            this.dot = new window.TMap.visualization.Dot({
                styles: {
                    default: {
                        fillColor: '#FFF', //圆形填充颜色
                        radius: 2 //圆形半径
                    }
                },
                zIndex: 4,
                enableBloom: true // 泛光
            })
                .addTo(this.map)
                .setData(dotData);

            this.heat = new window.TMap.visualization.Heat({
                max: 60, // 热力最强阈值
                min: 0, // 热力最弱阈值
                height: 50, // 峰值高度
                gradientColor: new window.TMap.GradientColor({
                    stops: {
                        0.2: '#7CFFB2',
                        0.5: '#58D9F9',
                        0.7: '#FDDD60',
                        0.9: '#FF6E76'
                    }
                }),
                enableLighting: true,
                zIndex: 5,
                radius: 30 // 最大辐射半径
            })
                .addTo(this.map)
                .setData(Object.values(heatData));
        }
    },
    watch: {
        detail: {
            deep: true,
            handler() {
                this.resetMap();
            }
        }
    }
};
</script>

<style lang="less">
.map {
    flex: 0 0 62%;
    margin-bottom: 16px;
    overflow: hidden;
    padding: 0 !important;
}
</style>
