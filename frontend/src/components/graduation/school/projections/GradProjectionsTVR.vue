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
      <h3>Transcript Verification Reports (TVRs)</h3>
      <p>For current students reported in final year of a graduation program (Grade 12 or AD)</p>
      <ul>
        <li>
          <a href="" class="link-style">
            TVRs for Projected Non-Graduating Students
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>

        <li>
          <a href="" class="link-style">
            TVRs for Projected Graduating Students
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>

        <li>
          <a href="" class="link-style">
            Individual TVRs available by PEN
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>
      </ul>

      <h3>Graduation Projections Summary Reports ({{this.currentStartMoYr}} to {{this.currentEndMoYr}})</h3>
      <ul>
        <li>
          <a href="" class="link-style">
            Projected Non-Graduates - Summary Report
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>

        <li>
          <a href="" class="link-style">
            Projected Graduates - Summary Report
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>
      </ul>

      <h3>Historical Graduation Projected Summary Reports ({{this.histStartMoYr}} to {{this.histEndMoYr}})</h3>
      <ul>
        <li>
          <a href="" class="link-style">
            Projected Non-Graduates - Summary Report
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down"></i>
            </span>
          </a>
        </li>

        <li>
          <a href="" class="link-style">
            Projected Graduates - Summary Report
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
    
