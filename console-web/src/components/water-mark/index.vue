/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <section class="water-mark-wrapper">
        <slot />

        <div class="water-mark" :style="styles" />
    </section>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'WaterMark',
    computed: {
        ...mapGetters({
            waterMark: 'common/waterMark'
        }),
        styles() {
            return [
                'background-size: 332px',
                'background-repeat: repeat',
                `background-image: ${this.waterMark ? `url(${this.waterMark})` : 'none'}`
            ].join(';');
        }
    }
};
</script>

<style lang="less">
.water-mark-wrapper {
    position: relative;

    .water-mark {
        z-index: 9;
        position: absolute;
        left: 0;
        top: 60px;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }
}
</style>
