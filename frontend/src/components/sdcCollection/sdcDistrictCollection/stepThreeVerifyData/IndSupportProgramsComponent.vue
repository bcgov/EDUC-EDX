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
        :show-export-btn="true"
        :export-type="'csv_dis_indigenous'"
        :is-final-sign-off="isFinalSignOff"
        :is-collection-active="isCollectionActive"
      />
    </div>
    <div v-if="reportView === 'summary'">
      <SummaryComponent
        :headcount-type="config.summaryReport"
        :is-district-summary="true"
        :is-collection-active="isCollectionActive"
      >
        <template #reports="{ data, reportType }">
          <IndigenousHeadcountsComponent
            v-if="data && (reportType === 'indigenous' || reportType === 'indigenous-per-school')"
            :headcount-table-data="data"
            :table-i-d="reportType === 'indigenous' ? getIndigenousHeadcountsComponentReport() : getIndigenousHeadcountsComponentPerSchoolReport()"
          />
          <BandHeadcountsComponent
            v-if="data && (reportType === 'band-codes' || reportType === 'band-codes-per-school')"
            :headcount-table-data="data"
            :table-i-d="reportType === 'band-codes' ? getBandHeadcountsComponentReport() : getBandHeadcountsComponentPerSchoolReport()"
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
    },
    isFinalSignOff: {
      type: Boolean,
      required: false
    },
    isCollectionActive: {
      type: Boolean,
      required: true
    }
  },
  emits: [],
  data() {
    return {
      reportView: this.isFinalSignOff ? 'summary' : 'detail',
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
    },
    getIndigenousHeadcountsComponentReport() {
      return INDSUPPORT_PR.summaryReport[0].tableID;
    },
    getIndigenousHeadcountsComponentPerSchoolReport() {
      return INDSUPPORT_PR.summaryReport[1].tableID;
    },
    getBandHeadcountsComponentReport() {
      return INDSUPPORT_PR.summaryReport[2].tableID;
    },
    getBandHeadcountsComponentPerSchoolReport() {
      return INDSUPPORT_PR.summaryReport[3].tableID;
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

