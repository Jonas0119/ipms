/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { IpmsComponent } from '../common/component';
import { isImageFile, chooseFile, isVideoFile } from './utils';
import { chooseImageProps, chooseVideoProps } from './shared';
import { isBoolean, isPromise } from '../common/validator';
import unifiedStorage from '../../utils/unified-storage';
IpmsComponent({
    props: Object.assign(
        Object.assign(
            {
                disabled: Boolean,
                multiple: Boolean,
                uploadText: String,
                useBeforeRead: Boolean,
                afterRead: null,
                beforeRead: null,
                previewSize: {
                    type: null,
                    value: 80
                },
                name: {
                    type: null,
                    value: ''
                },
                accept: {
                    type: String,
                    value: 'image'
                },
                fileList: {
                    type: Array,
                    value: [],
                    observer: 'formatFileList'
                },
                maxSize: {
                    type: Number,
                    value: Number.MAX_VALUE
                },
                maxCount: {
                    type: Number,
                    value: 100
                },
                deletable: {
                    type: Boolean,
                    value: true
                },
                showUpload: {
                    type: Boolean,
                    value: true
                },
                previewImage: {
                    type: Boolean,
                    value: true
                },
                previewFullImage: {
                    type: Boolean,
                    value: true
                },
                imageFit: {
                    type: String,
                    value: 'scaleToFill'
                },
                uploadIcon: {
                    type: String,
                    value: 'photograph'
                },
                useUnifiedStorage: {
                    type: Boolean,
                    value: false
                },
                uploadDir: {
                    type: String,
                    value: ''
                }
            },
            chooseImageProps
        ),
        chooseVideoProps
    ),
    data: {
        lists: [],
        isInCount: true,
        uploading: false
    },
    methods: {
        formatFileList() {
            const { fileList = [], maxCount } = this.data;
            const lists = fileList.map(item =>
                Object.assign(Object.assign({}, item), {
                    isImage: isImageFile(item),
                    isVideo: isVideoFile(item),
                    deletable: isBoolean(item.deletable) ? item.deletable : true
                })
            );
            this.setData({ lists, isInCount: lists.length < maxCount });
        },
        getDetail(index) {
            return {
                name: this.data.name,
                index: index == null ? this.data.fileList.length : index
            };
        },
        startUpload() {
            const { maxCount, multiple, lists, disabled } = this.data;
            if (disabled) return;
            chooseFile(
                Object.assign(Object.assign({}, this.data), {
                    maxCount: maxCount - lists.length
                })
            )
                .then(res => {
                    this.onBeforeRead(multiple ? res : res[0]);
                })
                .catch(error => {
                    this.$emit('error', error);
                });
        },
        onBeforeRead(file) {
            const { beforeRead, useBeforeRead } = this.data;
            let res = true;
            if (typeof beforeRead === 'function') {
                res = beforeRead(file, this.getDetail());
            }
            if (useBeforeRead) {
                res = new Promise((resolve, reject) => {
                    this.$emit(
                        'before-read',
                        Object.assign(Object.assign({ file }, this.getDetail()), {
                            callback: ok => {
                                ok ? resolve() : reject();
                            }
                        })
                    );
                });
            }
            if (!res) {
                return;
            }
            if (isPromise(res)) {
                res.then(data => this.onAfterRead(data || file));
            } else {
                this.onAfterRead(file);
            }
        },
        onAfterRead(file) {
            const { maxSize, afterRead, useUnifiedStorage } = this.data;
            const oversize = Array.isArray(file) ? file.some(item => item.size > maxSize) : file.size > maxSize;
            if (oversize) {
                this.$emit('oversize', Object.assign({ file }, this.getDetail()));
                return;
            }
            
            if (useUnifiedStorage) {
                // 使用新的统一存储
                this.uploadWithUnifiedStorage(file);
            } else {
                // 保持原有逻辑不变
                if (typeof afterRead === 'function') {
                    afterRead(file, this.getDetail());
                }
                this.$emit('after-read', Object.assign({ file }, this.getDetail()));
            }
        },
        deleteItem(event) {
            const { index } = event.currentTarget.dataset;
            this.$emit(
                'delete',
                Object.assign(Object.assign({}, this.getDetail(index)), {
                    file: this.data.fileList[index]
                })
            );
        },
        onPreviewImage(event) {
            if (!this.data.previewFullImage) return;
            const { index } = event.currentTarget.dataset;
            const { lists } = this.data;
            const item = lists[index];
            wx.previewImage({
                urls: lists.filter(item => isImageFile(item)).map(item => item.url),
                current: item.url,
                fail() {
                    wx.showToast({ title: '预览图片失败', icon: 'none' });
                }
            });
        },
        onPreviewVideo(event) {
            if (!this.data.previewFullImage) return;
            const { index } = event.currentTarget.dataset;
            const { lists } = this.data;
            wx.previewMedia({
                sources: lists
                    .filter(item => isVideoFile(item))
                    .map(item => Object.assign(Object.assign({}, item), { type: 'video' })),
                current: index,
                fail() {
                    wx.showToast({ title: '预览视频失败', icon: 'none' });
                }
            });
        },
        onPreviewFile(event) {
            const { index } = event.currentTarget.dataset;
            wx.openDocument({
                filePath: this.data.lists[index].url,
                showMenu: true
            });
        },
        onClickPreview(event) {
            const { index } = event.currentTarget.dataset;
            const item = this.data.lists[index];
            this.$emit('click-preview', Object.assign(Object.assign({}, item), this.getDetail(index)));
        },
        
        /**
         * 使用统一存储上传文件
         * @param {Object} file - 文件对象
         */
        async uploadWithUnifiedStorage(file) {
            if (this.data.uploading) {
                console.warn('[Uploader] 上传中，请勿重复操作');
                return;
            }
            
            this.setData({ uploading: true });
            
            try {
                console.log('[Uploader] 开始统一存储上传:', file);
                
                const filePath = file.url || file.path;
                const filename = file.name || `upload_${Date.now()}`;
                const mimetype = file.type || 'image/jpeg';
                const dir = this.data.uploadDir || '';
                
                const result = await unifiedStorage.upload(filePath, filename, mimetype, dir);
                
                console.log('[Uploader] 统一存储上传成功:', result);
                
                // 构造返回的文件对象
                const uploadedFile = {
                    ...file,
                    url: result.url,
                    key: result.key,
                    uploaded: true
                };
                
                // 触发成功事件
                this.$emit('after-read', Object.assign({ file: uploadedFile }, this.getDetail()));
                this.$emit('upload-success', { file: uploadedFile, result });
                
            } catch (error) {
                console.error('[Uploader] 统一存储上传失败:', error);
                
                // 触发失败事件
                this.$emit('upload-error', { 
                    file, 
                    error: error.message || '上传失败',
                    detail: this.getDetail()
                });
                
                // 也触发原有的error事件保持兼容性
                this.$emit('error', { 
                    message: error.message || '上传失败',
                    file 
                });
                
            } finally {
                this.setData({ uploading: false });
            }
        }
    }
});
