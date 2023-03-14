<template>
  <div>
    <v-overlay :value="isLoading">
      <v-progress-circular
        indeterminate
        size="64"
      />
    </v-overlay>
    <v-row
      v-if="!isLoading"
      justify="center"
    >
      <div class="control" />
    </v-row>
  </div>
</template>

<script>
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';
import 'viewerjs/dist/viewer.css';

export default {
  name: 'ImageRenderer',
  mixins: [alertMixin],
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    requestId: {
      type: String,
      required: true
    },
    imageId: {
      type: String,
      required: true
    }
  },
  emits: ['close-dialog'],
  data() {
    return {
      src: undefined,
      isLoading: true,
      documentID: ''
    };
  },
  watch: {
    dialog(newValue) {
      this.ImageRenderDialog = newValue;
    },
    imageId(newValue) {
      this.documentID = newValue;
      this.isLoading = true;
      this.src = undefined;
      if (this.documentID?.length > 0) {
        ApiService.apiAxios.get(`${ApiRoutes.edx.EXCHANGE_URL}/${this.requestId}/documents/${this.imageId}`).then((response) => {
          this.src = 'data:image/jpeg;base64,' + response.data?.documentData;
          this.previewImgObject();
        }).catch(e => {
          console.error(e);
          this.setFailureAlert('Could not load image. Please try again later.');
        }).finally(() => {
          this.isLoading = false;
        });
      }
    }
  },
  methods: {
    previewImgObject () {
      let image = [{'src': this.src,'data-source': this.src}];
      this.$viewerApi({
        options: {
          toolbar: true,
          url: 'data-source',
          navbar: false,
          title: false,
          scalable: false,
          hide: this.closeDialog(),
          initialViewIndex: 0
        },
        images: image
      });
    },
    closeDialog(){
      this.$emit('close-dialog');
    }
  },
};
</script>
