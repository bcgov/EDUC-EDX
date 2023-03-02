<template>
  <v-tooltip v-model="showTooltip" right>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
          :id="id"
          color="#38598A"
          :disabled="disabled"
          :dark="!disabled"
          size="30"
          icon
          v-bind="attrs"
          @click.native.stop="copy(copyText)"
          :title="`Copy ${copyText} to the clipboard.`"
      >
        <v-icon style="color: white" v-if="icon" :class="iconStyle" size="18">
          {{ icon }}
        </v-icon>
      </v-btn>
    </template>
    <span>Copied {{copyText }}.</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'ClipboardButton',
  props: {
    id: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
    },
    iconStyle: {
      type: String
    },
    copyText: {
      type: String
    },
  },
  data() {
    return {
      showTooltip: false
    };
  },
  methods: {
    copy(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showTooltip = true;
        setTimeout(() => this.showTooltip = false, 2000);
      });
    }
  }
};
</script>
