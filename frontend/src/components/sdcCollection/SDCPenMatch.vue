<template>
  <v-row v-if="isLoadingMatches">
    <v-col class="d-flex justify-center">
      <Spinner
        :flat="true"
      />
    </v-col>
  </v-row>
  <div v-else>
    <v-card>
      <v-card-title>
        <span>PEN Match</span>
      </v-card-title>
      <v-card-text>
        <v-row v-if="showMatchStatus">
          <v-col>
            <div>We have a run a PEN match for this student and have found a single result.</div>
            <div>Do you wish to use it as your submitted PEN?</div>
          </v-col>
        </v-row>
        <v-row v-else-if="showMultiStatus">
          <v-col>
            <div>We have a run a PEN match for this student and have found a multiple results.</div>
            <div>One of our Ministry representatives will determine the right PEN. Do you wish to proceed?</div>
          </v-col>
        </v-row>
        <v-row v-else-if="showNewStatus">
          <v-col>
            <div>We have a run a PEN match for this student and have no results.</div>
            <div>Do you wish to generate a PEN for this student now?</div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-row>
          <v-col class="d-flex justify-end">
            <v-btn
              id="cancelMatchButton"
              color="#003366"
              text="Cancel"
              variant="outlined"
              @click="cancelClicked"
            />
            <v-btn
              v-if="showMatchStatus"
              id="useFoundPENButton"
              color="#003366"
              variant="elevated"
              text="Use PEN"
            />
            <v-btn
              v-else-if="showMultiStatus"
              id="penRequestButton"
              color="#003366"
              variant="elevated"
              text="Yes"
            />
            <v-btn
              v-else-if="showNewStatus"
              id="generatePEN"
              color="#003366"
              variant="elevated"
              text="Generate PEN"
            />
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>

import {constructPenMatchObjectFromSdcStudent} from '../../utils/common';
import Spinner from '../common/Spinner.vue';
import alertMixin from '../../mixins/alertMixin';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';

export default {
  name: 'SDCPenMatch',
  components: {Spinner},
  mixins: [alertMixin],
  props: {
    sdcStudent: {
      type: Object,
      required: true
    }
  },
  emits: ['cancel', 'useFoundPEN', 'requestStaffPENCheck'],
  data() {
    return {
      penMatchStatus: null,
      isLoadingMatches: true,
      isSearchingStudent: false,
      showMatchStatus: false,
      showMultiStatus: false,
      showNewStatus: false
    };
  },
  async created() {
    await this.runPenMatch();
  },
  methods: {
    cancelClicked(){
      this.$emit('cancel','');
    },
    async runPenMatch() {
      this.isLoadingMatches = true;
      try {
        const result =  await ApiService.apiAxios.post(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.sdcStudent.sdcSchoolCollectionStudentID}/penMatch`, constructPenMatchObjectFromSdcStudent(this.sdcStudent));
        this.penMatchStatus = result.data.status;
        if(this.penMatchStatus === 'MATCH'){
          this.showMatchStatus = true;
        }else if(this.penMatchStatus === 'MULTI'){
          this.showMultiStatus = true;
        }else if(this.penMatchStatus === 'NEW'){
          this.showNewStatus = true;
        }
      } catch (error) {
        console.log(error);
        this.setFailureAlert('PEN Match API call failed, please try again.');
      } finally {
        this.isLoadingMatches = false;
      }
    }
  }
};
</script>

<style scoped>

</style>
