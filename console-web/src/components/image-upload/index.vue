/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <div class="image-upload">
        <Progress :percent="uploadProgress" status="active" v-if="uploading" />
        <div class="image-upload-preview" v-if="!uploading && result">
            <img v-lazy="getImageUrl(result)" />
        </div>
        <Upload
            :disabled="uploading"
            accept="image/*"
            :show-upload-list="false"
            action="data:,"
            :before-upload="onBeforeUpload"
            class="upload"
            ref="upload"
        >
            <Button :loading="uploading">
                <Icon type="ios-cloud-upload-outline" :size="18" />
                <span>{{ !this.result ? text : updateText }}</span>
            </Button>
        </Upload>
    </div>
</template>

<script>
import { Upload, Button, Icon, Progress, Message } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import { ASSET_HOST } from '@/config';
import * as utils from '@/utils';

export default {
    name: 'ImageUpload',
    props: {
        width: Number,
        height: Number,
        value: String,
        dir: {
            type: String,
            required: true
        },
        text: {
            type: String,
            default: '上传图片'
        },
        updateText: {
            type: String,
            default: '修改图片'
        }
    },
    data() {
        return {
            ASSET_HOST,
            uploading: false,
            uploadProgress: 0,
            result: this.value,
            storageConfig: null
        };
    },
    mixins: [Emitter],
    async created() {
        // 页面加载时获取存储配置
        try {
            this.storageConfig = await utils.upload.getStorageConfig();
        } catch (error) {
            console.error('获取存储配置失败:', error);
            // 在系统未初始化时，这是正常的，不需要显示错误
        }
    },
    methods: {
        async onBeforeUpload(file) {
            this.uploading = true;
            this.uploadProgress = 0;
            this.result = null;

            try {
                // 重新获取最新的存储配置
                try {
                    this.storageConfig = await utils.upload.getStorageConfig();
                } catch (configError) {
                    console.error('获取存储配置失败:', configError);
                    throw new Error('无法获取存储配置，请确保后端存储服务已正确配置');
                }

                // 图片尺寸验证
                if (this.width || this.height) {
                    const isValid = await this.validateImageSize(file);
                    if (!isValid) {
                        this.uploading = false;
                        return false;
                    }
                }

                // 使用统一上传服务
                const response = await utils.upload.upload(file, {
                    dir: this.dir,
                    onProgress: progress => {
                        this.uploadProgress = progress;
                    }
                });

                if (response.code === 200) {
                    this.result = response.data.url;
                    this.uploading = false;
                    this.$emit('input', this.result);
                    this.$emit('on-change', this.result);
                    this.dispatch('FormItem', 'on-form-change', this.result);
                    this.$refs.upload.clearFiles();
                } else {
                    throw new Error(response.message || '上传失败');
                }
            } catch (error) {
                this.uploading = false;
                this.result = null;
                this.$emit('input', '');
                this.$emit('on-change', '');
                this.dispatch('FormItem', 'on-form-change', '');
                this.$refs.upload.clearFiles();
                Message.error(error.message || '上传失败');
            }

            // 阻止默认上传行为
            return false;
        },

        async validateImageSize(file) {
            return new Promise(resolve => {
                utils.image.parse(file).then(
                    img => {
                        if (this.width && this.width !== img.width) {
                            Message.error(`请上传${this.width}宽度的图片`);
                            resolve(false);
                        } else if (this.height && this.height !== img.height) {
                            Message.error(`请上传${this.height}高度的图片`);
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    },
                    () => {
                        Message.error('图片解析失败');
                        resolve(false);
                    }
                );
            });
        },

        getImageUrl(url) {
            if (!url) return '';

            // 如果是完整URL，直接返回
            if (url.startsWith('http')) {
                return url;
            }

            // 否则拼接baseUrl
            const baseUrl = this.storageConfig?.baseUrl || ASSET_HOST;
            return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
        }
    },
    watch: {
        value(cur) {
            this.result = cur;
        }
    },
    components: {
        Upload,
        Button,
        Icon,
        Progress
    }
};
</script>

<style lang="less">
.image-upload {
    width: 100%;

    &-preview {
        margin-bottom: 20px;
        overflow: hidden;
        max-width: 680px;

        img {
            max-width: 100%;
        }
    }
}
</style>
