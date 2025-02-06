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
      <h3>
        Student Transcripts
      </h3>
      <ul>
        <li>
          <a href="" class="link-style">
            Student Transcript Preview(s)
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>

        <li>
          <a href="" class="link-style">
            XML Preview(s)
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>
      </ul>
      <h3>Graduation Summary Reports ({{currentStartMoYr}} to {{currentEndMoYr}})</h3>
      <p>Daily, cumulative lists of students in the current cycle, either graduated or not yet graduated, based on the latest information submitted by the school.</p>
      <ul>
        <li>
          <a href="" class="link-style">
            Graduated Students
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>
        <li>
          <a href="" class="link-style">
            Not-Yet Graduated Students
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>
      </ul>
      <h3> Historical Graduation Summary Reports ({{histStartMoYr}} to {{histEndMoYr}})</h3>
      <p>Lists of students in previous cycles, either graduated or not yet graduated, based on the final information submitted by the school during the cycle.</p>
      <ul>
        <li>
          <a href="" class="link-style">
            Graduated Students
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>
        <li>
          <a href="" class="link-style">
            Not-Yet Graduated Students
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </v-container>
</template>
    
<script>
import alertMixin from '../../../../mixins/alertMixin';
import {generateGradStartAndEndDateStrings} from "../../../../utils/common";
    
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
      currentStartMoYr: '',
      currentEndMoYr: '',
      histStartMoYr: '',
      histEndMoYr: ''
    };
  },
  computed: {

  },
  watch: {

  },
  async created() {
    this.populateDateRanges();
  },
  beforeUnmount() {
        
  },
  methods: {
    backButtonClick() {
      this.$router.push({name: 'graduation', params: {instituteIdentifierID: this.schoolID}});
    },
    populateDateRanges(){
      let datesList = generateGradStartAndEndDateStrings();
      this.currentStartMoYr = datesList.shift();
      this.currentEndMoYr = datesList.shift();
      this.histStartMoYr = datesList.shift();
      this.histEndMoYr = datesList.shift();
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

  h3 {
    color: #38598a;
  }

  ul {
    list-style-type: none;
    padding-top: 1em;
    padding-bottom: 2em;
  }

  li {
    padding-top: 1em;
  }

  p {
    padding-top: 1em;
    font-style: italic;
  }

  i {
    font-size: 1.25em;
  }

  .link-style {
    display: inline-flex;
    align-items: center;
  }

  ::v-deep .v-theme--myCustomLightTheme.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) span {
    color: white !important;
  }
</style>
    
