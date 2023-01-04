<template>
  <div>
    <v-overlay :value="isLoading">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-row justify="center" v-if="!isLoading">
      <div class="control">
      </div>
    </v-row>
  </div>
</template>

<script>
import ApiService from '@/common/apiService';
import {ApiRoutes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import 'viewerjs/dist/viewer.css';
import Viewer from 'v-viewer';
import Vue from 'vue';
Vue.use(Viewer, {
  debug: true,
  defaultOptions: {
    zIndex: 9999
  }
});

export default {
  name: 'ImageRenderer',
  mixins: [alertMixin],
  data() {
    return {
      src: undefined,
      isLoading: false,
      documentID: ''
    };
  },
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
  methods: {
    previewImgObject (imageArray) {
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
        images: imageArray
      });
    },
    closeDialog(){
      this.$emit('closeDialog');
    }
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
        let imageArray = [];
        ApiService.apiAxios.get(`${ApiRoutes.edx.EXCHANGE_URL}/${this.requestId}/documents/${this.imageId}`).then((response) => {

          if(Array.isArray(response.data?.documentData)){
            response.data?.documentData.forEach((pngPDF) => {
              let base64Img = 'data:application/png;base64,' + pngPDF;
              imageArray.push({'src': base64Img,'data-source': base64Img});
            });
          }else{
            let base64Img = 'data:application/png;base64,' + response.data?.documentData;
            imageArray.push({'src': base64Img,'data-source': base64Img});
          }
          this.previewImgObject(imageArray);
        }).catch(e => {
          console.error(e);
          this.setFailureAlert('Could not load image. Please try again later.');
        }).finally(() => {
          this.isLoading = false;
        });
      }
    }
  },
};
</script>
