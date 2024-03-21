<template>
  <v-container
    id="indProgTab"
    fluid
  >
    <v-row class="mt-3 mb-3">
      <v-btn-toggle rounded="0">
        <v-btn
          id="detailButton"
          size="large"
          class="detail-button"
          :class="{ 'active-button': reportView === 'detail' }"
          @click="showDetail"
        >
          Detail View
        </v-btn>
        <v-btn
          id="indProgSummaryButton"
          size="large"
          class="summary-button"
          :class="{ 'active-button': reportView === 'summary' }"
          @click="showSummary"
        >
          Summary View
        </v-btn>
      </v-btn-toggle>
    </v-row>
  
    <div v-if="reportView === 'detail'">
      <DetailComponent
        :config="config"
        :school="school"
      />
    </div>
    <div v-if="reportView === 'summary'">
      <SummaryComponent
        :headcount-type="config.headcountEndpoint"
        v-on:compare-change="handleComparisonChange"
      >
        <template #reports="{ data }">
          <IndigenousHeadcountsComponent
            v-if="data"
            :headcount-table-data="data"
          />
        </template>
      </SummaryComponent>
      <BandHeadcountsComponent
          :band-headcount-data="bandHeadcountData"
      />
    </div>
  </v-container>
</template>
    
<script>
import alertMixin from '../../../mixins/alertMixin';
import DetailComponent from './DetailComponent.vue';
import SummaryComponent from './SummaryComponent.vue';
import {INDSUPPORT_PR} from '../../../utils/sdc/TableConfiguration';
import IndigenousHeadcountsComponent from '../stepOneUploadData/IndigenousHeadcountsComponent.vue';
import BandHeadcountsComponent from "./BandHeadcountsComponent.vue";
import ApiService from "../../../common/apiService";
import {ApiRoutes} from "../../../utils/constants";
  
export default {
  name: 'IndSupportProgramsComponent',
  components: {
    BandHeadcountsComponent,
    IndigenousHeadcountsComponent,
    DetailComponent,
    SummaryComponent
  },
  mixins: [alertMixin],
  props: {
    school: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: [],
  data() {
    return {
      reportView: 'detail',
      config: INDSUPPORT_PR,
      bandHeadcountData: null,
      compareActive: false
    };
  },
  computed: {
    
  },
  mounted() {
    this.getBandHeadcountData();
  },
  methods: {
    showDetail() {
      this.reportView = 'detail';
    },
    showSummary() {
      this.reportView = 'summary';
    },
    handleComparisonChange(compareState){
      this.compareActive = compareState;
      this.getBandHeadcountData();
    },
    getBandHeadcountData(){
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/getStudentHeadcounts/${this.$route.params.schoolCollectionID}`, {
        params: {
          type: 'band-codes',
          compare: this.compareActive
        }
      }).then(response => {
        this.bandHeadcountData = response.data.headcountResultsTable;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
   
  }
};
</script>

<style scoped>
.detail-button {
  border: 1px solid lightgray;
}

.summary-button {
  border: 1px solid lightgray;
}

.active-button {
  background-color: #003366 !important;
  color: white !important;
  border: 1px solid #003366;
}
</style>

