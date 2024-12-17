<template>
  <v-container 
    fluid
  >
    <div class="mt-1 mb-1">
      <v-icon
        small
        color="#1976d2"
      >
        mdi-arrow-left
      </v-icon>
      <a
        class="ml-1"
        @click="backButtonClick"
      >Return to GRAD Dashboard</a>
    </div>
    <div
      class="border"
    >
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
          value="Transcript verification Reports (TVRs)"
          transition="false"
          reverse-transition="false"
        >
          <v-alert
            text="For current students reported in final year of a graduation program (Grade 12 or AD)"
            type="info"
            variant="tonal"
            class="mt-5"
          />
          <v-row class="pt-5">
            <v-col cols="5">
              <v-select
                id="reports"
                v-model="reportType"
                :items="tvr"
                item-value="endpoint"
                item-title="title"
                label="Reports"
                variant="underlined"
                @update:model-value="getTvrReport()"
              />
            </v-col>
          </v-row>
          <v-row v-if="tvrFlag">
            <v-col>
              <p>Report not available</p>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item
          value="Graduation Projections Summary Reports"
          transition="false"
          reverse-transition="false"
        >
          <v-row class="pt-5">
            <v-col cols="5">
              <v-select
                id="reports"
                v-model="summaryReportType"
                :items="summary"
                item-value="endpoint"
                item-title="title"
                label="Reports"
                variant="underlined"
                @update:model-value="getSummaryReport()"
              />
            </v-col>
          </v-row>
          <v-row v-if="summaryFlag">
            <v-col>
              <p>Report not available</p>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item
          value="Historical Graduation Projected Summary Reports"
          transition="false"
          reverse-transition="false"
        >
          <v-row class="pt-5">
            <v-col cols="5">
              <v-select
                id="reports"
                v-model="historyReportType"
                :items="historical"
                item-value="endpoint"
                item-title="title"
                label="Reports"
                variant="underlined"
                @update:model-value="getHistoricalReport()"
              />
            </v-col>
          </v-row>
          <v-row v-if="historyFlag">
            <v-col>
              <p>Report not available</p>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </div>
  </v-container>
</template>
    
<script>
import alertMixin from '../../../../mixins/alertMixin';
    
export default {
  name: 'GradProjectionsTVR',
  components: {
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: [],
  data() {
    return {
      tvrFlag: false,
      summaryFlag: false,
      historyFlag: false,
      tab: null,
      reportType: null,
      summaryReportType: null,
      historyReportType: null,
      tabs: [
        'Transcript verification Reports (TVRs)',
        'Graduation Projections Summary Reports',
        'Historical Graduation Projected Summary Reports'
      ],
      tvr: [
        { name: 'tvrNonGrad', title: 'TVRs for Projected Non-Graduating Students', endpoint:'a'},
        { name: 'tvrGrad', title: 'TVRs for Projected Graduating Students', endpoint:'b'},
        { name: 'tvrByPEN', title: 'Individual TVRs available by PEN', endpoint:'c'}
      ],
      summary: [
        { name: 'nonGradSummary', title: 'Projected Non-Graduates Summary Report', endpoint:'a'},
        { name: 'gradSummary', title: 'Projected Graduates Summary Report', endpoint:'b'},
      ],
      historical: [
        { name: 'histSummary', title: 'Archived Projected Non-Graduates Summary Report', endpoint:'a'},
      ],
    };
  },
  computed: {

  },
  watch: {

  },
  async created() {

  },
  beforeUnmount() {
        
  },
  methods: {
    backButtonClick() {
      this.$router.push({name: 'graduation', params: {instituteIdentifierID: this.schoolID}});
    },
    getTvrReport() {
      this.tvrFlag = true;
    },
    getSummaryReport() {
      this.summaryFlag = true;
    },
    getHistoricalReport() {
      this.historyFlag = true;
    }
  }
};
</script>
    
    <style scoped>
    
      .border {
        border: 2px solid grey;
        border-radius: 5px;
        padding: 35px;
        margin: 2em;
      }

     :deep(.v-btn__content){
       white-space: break-spaces;
     }
  
  ::v-deep .v-theme--myCustomLightTheme.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) span {
    color: white !important;
  }

  .divider {
  border-right: 1px solid lightgray;
  border-radius: 0px;
}

.divider:last-child  {
  border-right: 0
}
    </style>
    
