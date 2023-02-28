<template>
  <v-hover v-slot:default="{ hover }">
    <v-btn :id="id"
           :title="title||text"
           :class="[(hover && !disabled) ? secondary ?  this.class + ' button-hover white--text': this.class + ' button-hover':  this.class + '']"
           color="#003366"
           :variant="secondary ? 'outlined' : 'elevated'"
           :small="short"
           :disabled="disabled"
           :dark="!disabled"
           :to="to"
           :width="width"
           :loading="loading"
           v-bind="bind"
           v-on:click="clickAction"
    >
      <v-icon :color="secondary ? '#003366': 'white'" class="ml-n1 mr-1" v-if="icon" :nudge-down="4" :large="largeIcon" right dark>{{ icon }}</v-icon>
      <span :style="secondary ? 'color: #003366': 'color: white'" class="ml-1">{{ text }}</span>
    </v-btn>
  </v-hover>
</template>

<script>
export default {
  name: 'PrimaryButton',
  inheritAttrs: false,
  props: {
    class:{
      type: String
    },
    id: {
      type: String
    },
    text: {
      type: String
    },
    short: {
      type: Boolean,
      default: false
    },
    secondary: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    to: {
      type: String,
    },
    width: {
      type: String,
    },
    loading: {
      type: Boolean
    },
    icon: {
      type: String
    },
    bind: {
      type: Object
    },
    clickAction: {
      type: Function
    },
    largeIcon: {
      type: Boolean,
      default: false
    },
    title:{
      type: String,
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v-btn {
  text-transform: none;
}
.button-hover {
  background-color: #38598A !important;
}
.theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  background-color: #003366 !important;
  opacity: 0.298039215686275;
  color: white !important;
}

.theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) .v-icon {
  color: white !important;
}
</style>
