<template>
  <v-row justify="center">
    <v-col>
      <v-dialog
        v-model="PDFRenderDialog"
        max-width="80%"
      >
        <v-card>
          <v-card-title class="px-0 pb-0 pt-5">
            <v-list-item>
              <v-list-item-title class="pt-0 pl-2">
                <slot name="headLine">
                  <v-list-item-title class="headline">
                    Document Viewer
                  </v-list-item-title>
                </slot>
              </v-list-item-title>
              <v-list-item-action class="my-0">
                <v-btn
                  id="closePDFRendererModalBtn"
                  text
                  icon
                  @click="PDFRenderDialog=false"
                >
                  <v-icon
                    large
                    color="#38598A"
                  >
                    mdi-close
                  </v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-card-title>
          <v-spacer />
          <v-card style="min-height: 740px">
            <v-card-text>
              <v-row
                v-if="isLoading"
                class="fill-height ma-0"
                align="center"
                justify="center"
              >
                <v-progress-circular
                  :size="70"
                  :width="7"
                  color="primary"
                  indeterminate
                />
              </v-row>
              <v-spacer />
              <v-row
                v-if="!isLoading"
                justify="center"
              />
            </v-card-text>
          </v-card>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';

export default {
  name: 'PdfRenderer',
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
    documentId: {
      type: String,
      required: true
    }
  },
  emits: ['close-dialog'],
  // components: {
  //   VuePdfEmbed
  // },
  data() {
    return {
      arrayBuffer: undefined,
      isLoading: true,
      PDFRenderDialog: false,
      documentID: ''
    };
  },
  watch: {
    dialog(newValue) {
      this.PDFRenderDialog = newValue;
    },
    PDFRenderDialog(newValue) {
      if(!newValue && this.dialog) {
        this.$emit('close-dialog');
      }
    },
    documentId(newValue) {
      this.documentID = newValue;
      this.isLoading = true;
      this.arrayBuffer = undefined;
      if (this.documentID?.length > 0) {
        ApiService.apiAxios.get(`${ApiRoutes.edx.EXCHANGE_URL}/${this.requestId}/documents/${this.documentID}`).then((response) => {
          this.base64ToArrayBuffer(response.data?.documentData);
        }).catch(e => {
          console.error(e);
          this.setFailureAlert('Could not load document. Please try again later.');
        }).finally(() => {
          this.isLoading = false;
        });
      }
    }
  },
  methods: {
    base64ToArrayBuffer(base64) {
      let binary_string = window.atob(base64);
      let len = binary_string.length;
      let bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      this.arrayBuffer = bytes.buffer;
    }
  }
};
</script>

<style>
.pdf-app #outerContainer{
  position: inherit !important;
}
</style>
