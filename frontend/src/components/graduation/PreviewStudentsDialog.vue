<template>
  <v-dialog
    v-model="dialog"
    :content-class="contentClass"
    :max-width="options.width"
    :style="{ zIndex: options.zIndex }"
  >
  <PreviewStudents
      :headers="summerHeaders"
      :summer-students="summerStudents"
      :district-i-d="districtID"
      @close="closeSheet"
      @process="process"
    />
  </v-dialog>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import PreviewStudents from './PreviewStudents.vue';
export default {
  name: 'PreviewStudentsDialog',
  components: {
    PrimaryButton,
    PreviewStudents},
  props: {
    contentClass: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    summerHeaders: [],
    summerStudents: [],
    districtID: null,
    options: {
      color: 'primary',
      zIndex: 2000000,
      dark: true,
      dense: true,
      closeIcon: false,
      messagePadding: 'pa-4',
      titleBold: false,
      subtitle: false,
      divider: false,
      resolveDisabled: false,
    }
  }),
  methods: {
    open(summerHeaders, summerStudents, districtID, options) {
      this.dialog = true;
      this.summerHeaders = summerHeaders;
      this.summerStudents = summerStudents;
      this.districtID = districtID;
      this.options = Object.assign(this.options, options);
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    process() {
      this.resolve(true);
      this.dialog = false;
    },
    closeSheet() {
      this.resolve(false);
      this.dialog = false;
    }
  }
};
</script>

<style scoped>
  .dialog-subtitle {
    font-size: 1rem;
  }

  :deep(.v-toolbar-title__placeholder){
    overflow: visible;
  }

  .header {
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
  }
</style>
