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
          @click="showDetail"
        >
          Detail View
        </v-btn>
        <v-btn
          id="summaryButton"
          size="large"
          class="summary-button"
          @click="showSummary"
        >
          Summary View
        </v-btn>
      </v-btn-toggle>
    </v-row>
  
    <div v-if="reportView === 'detail'">
      <DetailComponent :config="config" />
    </div>
  </v-container>
</template>
    
<script>
import alertMixin from '../../../mixins/alertMixin';
import DetailComponent from './DetailComponent.vue';
import { SPECIALED_PR } from '../../../utils/sdc/TableConfiguration';
  
export default {
  name: 'SpecialEduComponent',
  components: {
    DetailComponent
  },
  mixins: [alertMixin],
  props: {
  },
  emits: [],
  data() {
    return {
      reportView: 'detail',
      config: SPECIALED_PR

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
        background-color: #003366 !important;
  color: white !important;
      }

      .summary-button {
        color: #003366;
        border: 1px solid #003366;
      }

      </style>
      
      
    
  
