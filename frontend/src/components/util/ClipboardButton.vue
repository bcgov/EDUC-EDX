<template>
  <v-tooltip
    v-model="showTooltip"
    location="right"
    :open-on-hover="false"
  >
    <template #activator="{ props }">
      <v-btn
        :id="id"
        :color="backgroundColor"
        :disabled="disabled"
        :dark="!disabled"
        size="30"
        icon
        v-bind="props"
        :title="`Copy ${copyText} to the clipboard.`"
        :class="btnStyle"
        @click.stop.prevent="copy(copyText)"
      >
        <v-icon
          v-if="icon"
          :style="foregroundStyle"
          :class="iconStyle"
          size="18"
        >
          {{ icon }}
        </v-icon>
      </v-btn>
    </template>
    <span>Copied {{ copyText }}.</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'ClipboardButton',
  props: {
    id: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: null
    },
    backgroundColor:{
      type: String,
      default: '#38598A'
    },
    foregroundStyle:{
      type: String,
      default: 'color: white'
    },
    iconStyle: {
      type: String,
      default: null
    },
    copyText: {
      type: String,
      default: null
    },
    btnStyle: {
      type: String,
      default: null
    }
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
