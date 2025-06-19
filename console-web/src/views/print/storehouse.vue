/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <div>
        <div class="title">{{ title }}</div>
        <canvas ref="canvas" />
    </div>
</template>

<script>
import printMixin from '@/mixins/print';
import qrcode from 'qrcode';

export default {
    name: 'PrintStorehouseCode',
    data() {
        return {
            code: '',
            title: ''
        };
    },
    mixins: [printMixin],
    created() {
        this.code = this.$route.query.code;
        this.title = this.$route.query.title;
    },
    watch: {
        code(cur) {
            qrcode.toCanvas(this.$refs.canvas, cur, {
                width: 220,
                height: 220,
                margin: 0
            });

            this.print();
        }
    }
};
</script>
