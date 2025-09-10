/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { IpmsComponent } from '../common/component';
IpmsComponent({
    props: {
        // whether to show popup
        show: Boolean,
        // overlay custom style
        overlayStyle: Object,
        // z-index
        zIndex: {
            type: Number,
            value: 100
        },
        title: String,
        cancelText: {
            type: String,
            value: '取消'
        },
        description: String,
        options: {
            type: Array,
            value: []
        },
        overlay: {
            type: Boolean,
            value: true
        },
        safeAreaInsetBottom: {
            type: Boolean,
            value: true
        },
        closeOnClickOverlay: {
            type: Boolean,
            value: true
        },
        duration: {
            type: null,
            value: 300
        }
    },
    methods: {
        onClickOverlay() {
            this.$emit('click-overlay');
        },
        onCancel() {
            this.onClose();
            this.$emit('cancel');
        },
        onSelect(event) {
            this.$emit('select', event.detail);
        },
        onClose() {
            this.$emit('close');
        }
    }
});
