<template>
  <v-container
    id="enrollmentTab"
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
          id="fteSummaryButton"
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
        :school="school"
        :config="config"
        :show-export-btn="true"
        :export-type="'csv_school'"
        :is-final-sign-off="isFinalSignOff"
        :is-collection-active="isCollectionActive"
      />
    </div>
    <div v-if="reportView === 'summary'">
      <SummaryComponent
        :headcount-type="config.summaryReport"
        :is-collection-active="isCollectionActive"
      />
    </div>
  </v-container>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import DetailComponent from './DetailComponent.vue';
import SummaryComponent from '../../../common/SummaryComponent.vue';
import { FTE } from '../../../../utils/constants/TableConfiguration';

export default {
  name: 'FTEComponent',
  components: {
    DetailComponent,
    SummaryComponent
  },
  mixins: [alertMixin],
  props: {
    school: {
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
      config: FTE

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
