<template>
  <v-hover v-slot="{ hover }">
    <v-btn
      :id="id"
      :class="[hover ? 'button-hover':'']"
      color="#38598A"
      :small="short"
      :disabled="disabled"
      :dark="!disabled"
      :to="to"
      :width="width"
      :text="true"
      :min-width="minWidth"
      v-bind="bind"
    >
      <v-icon
        v-if="icon"
        :class="[iconStyle, 'mr-1']"
        left
      >
        {{ icon }}
      </v-icon>
      <strong>{{ text }}</strong>
    </v-btn>
  </v-hover>
</template>

<script>
export default {
  name: 'TertiaryButton',
  props: {
    id: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: null
    },
    short: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    to: {
      type: String,
      default: null
    },
    width: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    iconStyle: {
      type: String,
      default: null
    },
    minWidth: {
      type: String,
      default: null
    },
    bind: {
      type: Object,
      default: null
    },
    on: {
      type: Object,
      default: null
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v-btn {
  text-transform: none;
}
.button-hover {
  color: #003366 !important;
}
.theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  background-color: #38598A !important;
  opacity: 0.3;
  color: white !important;
}
</style>
