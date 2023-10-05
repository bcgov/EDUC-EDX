<script>
import {defineComponent} from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import moment from 'moment';

export default defineComponent({
  name: 'DatePicker',
  components: {VueDatePicker},
  props: {
    modelValue: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    rules: {
      type: Array,
      default: ()=>[]
    }
  },
  emits: ['update:modelValue', 'clearDate'],
  methods: {
    saveDate(newDate) {
      this.$emit('update:modelValue', moment(newDate).format('YYYY-MM-DD').toString());
    }
  }
});
</script>

<template>
  <VueDatePicker
    :model-value="modelValue"
    :enable-time-picker="false"
    model-type="format"
    format="yyyy-MM-dd"
    preview-format="yyyy-MM-dd"
    :text-input="true"
    :clearable="false"
    @update:model-value="saveDate"
  >
    <template #dp-input="{ value, onInput, onEnter, onTab }">
      <v-text-field
        type="text"
        :model-value="value"
        :rules="rules"
        prepend-inner-icon="mdi-calendar"
        :label="label"
        density="compact"
        variant="underlined"
        :clearable="true"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        @keydown.tab.prevent="onTab"
        @click:clear="$emit('clearDate')"
      />
    </template>
  </VueDatePicker>
</template>

<style scoped>
.dp__main{
  font-family: inherit;
  user-select: auto;
  box-sizing: border-box;
  position: relative;
  width: 100%;
}

.v-input--density-compact{
  --v-input-chips-margin-bottom: 0;
}
</style>
