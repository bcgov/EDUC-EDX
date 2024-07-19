<template>
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
      value="Detail and Summary Views"
      transition="false"
      reverse-transition="false"
    >
      <StepThreeVerifyData
        :is-step-complete="true"
        :is-final-sign-off="true"
        :school-collection-object="schoolCollectionObject"
      />
    </v-window-item>
    <v-window-item
      value="PEN Differences"
      transition="false"
      reverse-transition="false"
    >

    </v-window-item>
    <v-window-item
      value="Resolved Duplicates"
      transition="false"
      reverse-transition="false"
    >
      <ResolvedDuplicates
        :school-collection-object="schoolCollectionObject"
      />
    </v-window-item>
  </v-window>
</template>

<script>

import StepThreeVerifyData from './stepThreeVerifyData/StepThreeVerifyData.vue';
import ResolvedDuplicates from './ResolvedDuplicates.vue';

export default {
  name: 'CollectionSubmissionDetails',
  components: {ResolvedDuplicates, StepThreeVerifyData},
  props: {
    schoolCollectionObject: {
      type: Object,
      required: true,
      default: null
    },
  },
  data() {
    return {
      tab: null,
      tabs: ['Detail and Summary Views', 'PEN Differences', 'Resolved Duplicates'],
      type: 'SDC',
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      school: {},
    };
  },
};
</script>
