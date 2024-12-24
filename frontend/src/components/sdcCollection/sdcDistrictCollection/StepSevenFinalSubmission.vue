<template>
  <div :class="isCollectionActive ? 'border' : ''">
    <div v-if="isLoading">
      <v-row>
        <v-col class="d-flex justify-center">
          <v-progress-circular
            class="mt-16"
            :size="70"
            :width="7"
            color="primary"
            indeterminate
            :active="isLoading"
          />
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <v-row
        v-if="isCollectionActive"
        class="mb-3"
      >
        <v-col v-if="isCollectionSignedOff">
          <v-alert
            id="collection-submission"
            class="justify-start"
            type="success"
            variant="tonal"
            text="Thank you for completing the 1701 collection process for your district."
          />
        </v-col>
        <v-col v-else>
          <v-alert            
            id="collection-submission"
            class="justify-start"
            type="info"
            variant="tonal"
            text="Thank you for completing the 1701 collection process for your district. It is now ready for your final review and sign-off. Please use the Signatures tab for signing off."
          />
        </v-col>
      </v-row>      
      <StepThreeVerifyData
        :district-collection-object="districtCollectionObject"
        :is-final-sign-off="true"
        :is-collection-active="isCollectionActive"
        :show-final-submission-tabs="true"
        @refresh-collection-store="refreshStore"
      />
    </div>
  </div>
</template>

<script>

import alertMixin from '../../../mixins/alertMixin';
import StepThreeVerifyData from './stepThreeVerifyData/StepThreeVerifyData.vue';
import {sdcCollectionStore} from '../../../store/modules/sdcCollection';
import {mapState} from 'pinia';

export default {
  name: 'StepSevenFinalSubmission',
  components: {
    StepThreeVerifyData
  },
  mixins: [alertMixin],
  props: {
    districtCollectionObject: {
      type: Object,
      required: true,
      default: null
    },
    isStepComplete: {
      type: Boolean,
      required: true
    },
    isCollectionActive: {
      type: Boolean,
      required: true
    }
  },
  emits: [],
  data() {
    return {
      isCollectionSignedOff: false,
      signOffStatus: 'COMPLETED',
      isLoading: false,
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['districtCollection']),

  },
  mounted() {
    this.isCollectionSignedOff = this.signOffStatus === this.districtCollectionObject.sdcDistrictCollectionStatusCode;   
  },
  created() {
    
  },
  methods: {    
    refreshStore() {
      this.refreshDistrictCollection();
    },
    async refreshDistrictCollection() {
      this.isLoading = !this.isLoading;
      await sdcCollectionStore().getDistrictCollection(this.districtCollectionObject.sdcDistrictCollectionID).then(async () => {
        this.isCollectionSignedOff = this.signOffStatus === this.districtCollection.sdcDistrictCollectionStatusCode;
        this.isLoading = !this.isLoading;
      }).catch(e => {
        console.error(e);
      }).finally(() => {
        this.isLoading = false;
      });
    }
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

</style>
