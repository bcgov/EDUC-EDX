<template>
  <v-container 
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
          id="summaryButton"
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
      <DetailComponent :config="config" />
    </div>
    <div v-if="reportView === 'summary'">
      <SummaryComponent />
    </div>
  </v-container>
</template>
    
<script>
import alertMixin from '../../../mixins/alertMixin';
import DetailComponent from './DetailComponent.vue';
import SummaryComponent from './SummaryComponent.vue';
import { FTE } from '../../../utils/sdc/TableConfiguration';
  
export default {
  name: 'FTEComponent',
  components: {
    DetailComponent,
    SummaryComponent
  },
  mixins: [alertMixin],
  props: {
  },
  emits: [],
  data() {
    return {
      reportView: 'detail',
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
      
      
    
  
