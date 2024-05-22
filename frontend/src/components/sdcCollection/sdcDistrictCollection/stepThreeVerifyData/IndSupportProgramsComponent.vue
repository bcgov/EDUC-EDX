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
        :district="district"
      />
    </div>
    <div v-if="reportView === 'summary'">
      <SummaryComponent
        :headcount-type="config.summaryReport"
        :is-district-summary="true"
      >
        <template #reports="{ data, reportType }">
          <IndigenousHeadcountsComponent
            v-if="data && (reportType === 'indigenous' || reportType === 'indigenous-per-school')"
            :headcount-table-data="data"
          />
          <BandHeadcountsComponent
            v-if="data && (reportType === 'band-codes' || reportType === 'band-codes-per-school')"
            :headcount-table-data="data"
          />
        </template>
      </SummaryComponent>
    </div>
  </v-container>
</template>
    
<script>
import alertMixin from '../../../../mixins/alertMixin';
import DetailComponent from './DetailComponent.vue';
import SummaryComponent from '../../../common/SummaryComponent.vue';
import {INDSUPPORT_PR} from '../../../../utils/sdc/DistrictCollectionTableConfiguration';
import IndigenousHeadcountsComponent from '../../sdcSchoolCollection/stepOneUploadData/IndigenousHeadcountsComponent.vue';
import BandHeadcountsComponent from '../../sdcSchoolCollection/stepThreeVerifyData/BandHeadcountsComponent.vue';

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
    district: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: [],
  data() {
    return {
      reportView: 'detail',
      config: INDSUPPORT_PR
    };
  },
  computed: {
    
  },
  created() {
  },
  methods: {
    showDetail() {
      this.reportView = 'detail';

    },
    showSummary() {
      this.reportView = 'summary';
    }
   
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

