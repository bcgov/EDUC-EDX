<template>
  <v-btn
    id="exportCurrentStudents"
    color="#003366"
    text="Export Current Students"
    prepend-icon="mdi-tray-arrow-down"
    variant="outlined"
    :disabled="disabled"
    @click="$emit('click')"
  />
</template>

<script>
export default {
  name: 'ExportCurrentStudentsButton',
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
};
</script>
