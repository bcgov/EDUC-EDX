<template>
  <v-dialog
    v-model="dialog"
    :content-class="contentClass"
    :max-width="options.width"
    :style="{ zIndex: options.zIndex }"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-card-title class="header pt-1 pb-1">
        <slot name="title">
          {{ title }}
        </slot>
      </v-card-title>
      <v-card-text :class="[options.messagePadding, { 'black--text': !options.dark }]">
        {{ message }}
        <slot name="message" />
        <v-divider
          v-if="options.divider"
          class="mt-1"
        />
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <PrimaryButton
          id="rejectBtn"
          secondary
          :text="options.rejectText || 'Cancel'"
          :click-action="cancel"
        />
        <PrimaryButton
          id="resolveBtn"
          :text="options.resolveText || 'Yes'"
          :disabled="options.resolveDisabled"
          :click-action="agree"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from './PrimaryButton.vue';
export default {
  name: 'ConfirmationDialog',
  components: {PrimaryButton},
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
    message: null,
    title: null,
    options: {
      color: 'primary',
      width: 290,
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
    open(title, message, options) {
      this.dialog = true;
      this.title = title;
      this.message = message;
      this.options = Object.assign(this.options, options);
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    agree() {
      this.resolve(true);
      this.dialog = false;
    },
    cancel() {
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
