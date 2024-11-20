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
          value="Student Transcripts"
          transition="false"
          reverse-transition="false"
        >
          <v-row class="pt-5">
            <v-col cols="5">
              <v-select
                id="reports"
                v-model="reportType"
                :items="transcripts"
                item-value="endpoint"
                item-title="title"
                label="Reports"
                variant="underlined"
                @update:model-value="getTranscripts()"
              />
            </v-col>
          </v-row>
          <v-row v-if="transcriptFlag">
            <v-col>
              <p>Report not available</p>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item
          value="Graduation Summary Reports"
          transition="false"
          reverse-transition="false"
        >
          <v-alert
            text="Daily cumulative lists of students in the current cycle, either graduated or not yet graduated, based on the latest information submitted by the school."
            type="info"
            variant="tonal"
            class="mt-5"
          />
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
          value="Historical Graduation Summary Reports"
          transition="false"
          reverse-transition="false"
        >
          <v-alert
            text="Lists of students in previous cycles, either graduated or not yet graduated, based on the final information submitted by the school during the cycle."
            type="info"
            variant="tonal"
            class="mt-5"
          />
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
  name: 'GradReportsAndTranscripts',
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
      transcriptFlag: false,
      summaryFlag: false,
      historyFlag: false,
      tab: null,
      reportType: null,
      summaryReportType: null,
      historyReportType: null,
      tabs: [
        'Student Transcripts',
        'Graduation Summary Reports',
        'Historical Graduation Summary Reports'
      ],
      transcripts: [
        { name: 'transcripts', title: 'Students Transcripts', endpoint:'a'},
        { name: 'xml', title: 'XML Previews', endpoint:'b'},
      ],
      summary: [
        { name: 'GradSummary', title: 'Graduated Students', endpoint:'a'},
        { name: 'nonGradSummary', title: 'Not-Yet Graduated Students', endpoint:'b'},
      ],
      historical: [
        { name: 'histGrad', title: 'Graduated Students', endpoint:'a'},
        { name: 'histNotGrad', title: 'Not-Yet Graduated Students', endpoint:'b'},
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
      this.$router.push({name: 'graduation', params: {schoolID: this.schoolID}});
    },
    getTranscripts() {
      this.transcriptFlag = true;
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
    </style>
    
