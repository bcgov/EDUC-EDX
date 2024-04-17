<template>
   <v-row justify="end">
    <v-col>
      <PrimaryButton
      id="step-2-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Next"
      :click-action="next"
    />
    </v-col>
  </v-row>
</template>
<script>
import {defineComponent} from 'vue';
import PrimaryButton from '../../util/PrimaryButton.vue';

export default defineComponent({
  name: 'StepOneUploadData',
  components: {PrimaryButton},
  props: {
    isStepComplete: {
      type: Boolean,
      required: true
    }
  },
  emits: ['next'],
  methods: {
    next() {
      this.$emit('next');
    }
  }
});
</script>

<style scoped>

</style>
