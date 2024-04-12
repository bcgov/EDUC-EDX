<template>
  <div class="border">
    <v-tabs
      v-model="tab"
      color="#38598a"
      show-arrows
    >
      <v-tab
        v-for="name in tabs"
        :key="name"
        class="divider"
        :value="name"
      >
        {{ name }}
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item
        value="All Students"
        transition="false"
        reverse-transition="false"
      >
        <AllStudentsComponent
          v-if="tab==='All Students'"
        />
      </v-window-item>
      <v-window-item
        value="French Programs"
        transition="false"
        reverse-transition="false"
      >
        <FrenchProgramsComponent
          v-if="tab==='French Programs'"
        />
      </v-window-item>
      <v-window-item
        value="Career Programs"
        transition="false"
        reverse-transition="false"
      >
        <CareerProgramsComponent
          v-if="tab==='Career Programs'"
        />
      </v-window-item>
      <v-window-item
        value="Indigenous Students & Support Programs"
        transition="false"
        reverse-transition="false"
      >
        <IndSupportProgramsComponent
          v-if="tab==='Indigenous Students & Support Programs'"
        />
      </v-window-item>
      <v-window-item
        value="Special Education"
        transition="false"
        reverse-transition="false"
      >
        <SpecialEduComponent
          v-if="tab==='Special Education'"
        />
      </v-window-item>
      <v-window-item
        value="English Language Learning"
        transition="false"
        reverse-transition="false"
      >
        <EnglishLangComponent
          v-if="tab==='English Language Learning'"
        />
      </v-window-item>
      <v-window-item
        value="Refugee"
        transition="false"
        reverse-transition="false"
      >
        <RefugeeComponent
          v-if="tab==='Refugee'"
        />
      </v-window-item>
    </v-window> 
  </div>

  <v-row justify="end">
    <PrimaryButton
      id="step-3-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Verify as Correct"
      :click-action="next"
    />
  </v-row>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import { SDC_VERIFY_TABS } from '../../../../utils/sdc/SdcVerifyTabs';
import AllStudentsComponent from './AllStudentsComponent.vue';
import CareerProgramsComponent from './CareerProgramsComponent.vue';
import IndSupportProgramsComponent from './IndSupportProgramsComponent.vue';
import SpecialEduComponent from './SpecialEduComponent.vue';
import EnglishLangComponent from './EnglishLangComponent.vue';
import RefugeeComponent from './RefugeeComponent.vue';
import FrenchProgramsComponent from './FrenchProgramsComponent.vue';

export default {
  name: 'StepThreeVerifyData',
  components: {
    PrimaryButton,
    AllStudentsComponent,
    CareerProgramsComponent,
    IndSupportProgramsComponent,
    SpecialEduComponent,
    EnglishLangComponent,
    RefugeeComponent,
    FrenchProgramsComponent
  },
  mixins: [alertMixin],
  props: {

  },
  emits: ['next', 'previous'],
  data() {
    return {
      tab: null,
      tabs: SDC_VERIFY_TABS,
      type: 'SDC',

    };
  },
  computed: {
  },
  created() {

  },
  methods: {
    next() {
      if(this.isStepComplete) {
        this.$emit('next');
      } 
    },
  }
};
</script>

<style scoped>

.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}

.form-hint{
  color: rgb(56, 89, 138);
  font-size: 14px;
}

.divider {
  border-right: 1px solid lightgray;
  border-radius: 0px;
}

.divider:last-child  {
  border-right: 0
}
</style>