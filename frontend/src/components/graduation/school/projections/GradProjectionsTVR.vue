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
      <div class="sub-category-group mt-2">
        <h4 class="mt-8">Individual TVRs by PEN</h4>
        <p>Schools can now search for any TVR that exists in GRAD by PEN (not just current grade 12 or AD students). To View / Print an individual student's TVR report enter PEN below.</p>
        <v-form class="d-flex" v-model="studentPENIsValid" >
          <v-col cols="2">
            <v-text-field
                ref="studentPENField"
                v-model="studentPEN"
                placeholder="Enter PEN"
                :rules="penRules"
                variant="underlined"
            />
          </v-col>
          <v-col cols="2" class="pt-6">
            <PrimaryButton
                id="searchPENBtn"
                text="Search"
                :disabled="!studentPENIsValid"
                :click-action="searchStudentForGivenPEN"
            />
          </v-col>
        </v-form>

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
    </div>
    <PENSearchDialog
        v-model="showPENSearchDialog"
        :student="student"
        download-type="TVR"
        @close="close"
    />
  </v-container>
</template>
    
<script>
import alertMixin from '../../../../mixins/alertMixin';
import {generateGradStartAndEndDateStrings} from "../../../../utils/common";
import PrimaryButton from "../../../util/PrimaryButton.vue";
import {penIsValid} from "../../../../utils/institute/formRules";
import ApiService from "../../../../common/apiService";
import {ApiRoutes, MINISTRY_NAME} from "../../../../utils/constants";
import {isValidPEN} from "../../../../utils/validation";
import PENSearchDialog from "../../PENSearchDialog.vue";
    
export default {
  name: 'GradProjectionsTVR',
  components: {
    PENSearchDialog,
    PrimaryButton
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
      histEndMoYr: '',
      penRules: [v => !!v || 'Required', v => (!v || isValidPEN(v) || 'Invalid PEN')],
      studentPEN: null,
      studentPENIsValid: false,
      studentExists: false,
      student: {},
      showPENSearchDialog: false,
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
    penIsValid,
    backButtonClick() {
      this.$router.push({name: 'graduation', params: {instituteIdentifierID: this.schoolID}});
    },
    populateDateRanges(){
      let datesList = generateGradStartAndEndDateStrings();
      this.currentStartMoYr = datesList.shift();
      this.currentEndMoYr = datesList.shift();
      this.histStartMoYr = datesList.shift();
      this.histEndMoYr = datesList.shift();
    },
    searchStudentForGivenPEN() {
      this.student = {};

      ApiService.apiAxios.get(ApiRoutes.studentRequest.SEARCH_URL + "search-grad-pen", {
        params: {
          pen: this.studentPEN
        }
      })
      .then(res => {
        this.alert = false;
        this.student = {};
        this.student['pen'] = res.data.pen;
        this.student['studentID'] = res.data.studentID;
        this.student['fullName'] = res.data.firstName + ' ' + (res.data.middleName ?? '') + ' ' + res.data.lastName;
        this.student['localID'] = res.data.localID;
        this.student['gender'] = res.data.gender;
        this.student['dob'] = res.data.doB;

      })
      .catch(error => {
        if (error?.response?.data?.message) {
          this.setFailureAlert(error?.response?.data?.message);
        } else {
          this.setFailureAlert(`PEN must be a valid PEN associated with a student at the ${MINISTRY_NAME}`);
        }
      }).finally(() => {
        this.showPENSearchDialog = true;
      });
    },
    close() {
      this.showPENSearchDialog = false;
      this.student = {};
      this.studentPEN = null;

      this.$refs.studentPENField.reset();
    },
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
    
