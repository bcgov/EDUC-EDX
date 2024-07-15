<template>
<div class="border">


    <div>
        <v-row class="mb-3">
            <v-col>
                <v-alert
                    id="collection-submission"
                    class="justify-start"
                    type="info"
                    variant="tonal"
                    text="Thank you for completing the 1701 collection process for your district. It is now ready for your final review and sign-off. Please use the button below to provide your sign-off for all programs. "
                />
            </v-col>
        </v-row>

        <StepThreeVerifyData
            :district-collection-object="districtCollectionObject"
            :isFinalSignOff="true"
        />

        
        
        
    </div>
</div>
</template>

<script>

import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';



import StepThreeVerifyData from './stepThreeVerifyData/StepThreeVerifyData.vue';

export default {
  name: 'StepSevenFinalSubmission',
  components: {
    PrimaryButton,
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
    }
  },
  emits: [],
  data() {
    return {
      
    };
  },
  computed: {
  },
  async mounted() {

     
  },
  created() {
    
  },
  methods: {
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