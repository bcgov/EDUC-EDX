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
      <h4 class="mt-8">
        Individual TVRs by PEN
      </h4>
      <p>Schools can now search for any TVR that exists in GRAD by PEN (not just current grade 12 or AD students). To View / Print an individual student's TVR report enter PEN below.</p>
      <v-form
        v-model="studentPENIsValid"
        class="d-flex"
      >
        <v-col cols="2">
          <v-text-field
            ref="studentPENField"
            v-model="studentPEN"
            placeholder="Enter PEN"
            :rules="penRules"
            variant="underlined"
          />
        </v-col>
        <v-col
          cols="2"
          class="pt-6"
        >
          <PrimaryButton
            id="searchPENBtn"
            text="Search"
            :disabled="!studentPENIsValid"
            :click-action="searchStudentForGivenPEN"
          />
        </v-col>
      </v-form>

      <div class="sub-category-group mt-2">
        <h3>School Level Graduation Projection Summary Reports</h3>
        <p>Select a school from the list below to review the Graduation Summary Reports for the school.</p>
        <v-row
          class="align-center searchBox"
        >
          <v-col
            cols="12"
            md="4"
            lg="4"
            class="d-flex justify-start"
          >
            <v-autocomplete
              id="name-text-field"
              v-model="schoolCodeNameFilter"
              label="School Code & Name"
              variant="underlined"
              item-value="schoolID"
              item-title="schoolCodeName"
              autocomplete="off"
              :items="schoolSearchNames"
              :clearable="true"
              @update:model-value="searchButtonClick"
            >
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  title=""
                >
                  <v-list-item-title style="color: black !important;">
                    {{
                      item.title
                    }}
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <div
          id="districtGradReports"
          @click="handleDistrictReportsDivClick"
        >
          <div :class="{ 'disabled-section': !schoolCodeNameFilter }">
            <div class="ps-8">
              <h3>Transcript Verification Reports (TVRs)</h3>
              <p>For current students reported in final year of a graduation program (Grade 12 or AD)</p>
              <ul>
                <li>
                  <a
                    href=""
                    class="link-style"
                  >
                    TVRs for Projected Non-Graduating Students
                    <span class="icon-container ml-1">
                      <i class="mdi mdi-tray-arrow-down" />
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    href=""
                    class="link-style"
                  >
                    TVRs for Projected Graduating Students
                    <span class="icon-container ml-1">
                      <i class="mdi mdi-tray-arrow-down" />
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    href=""
                    class="link-style"
                  >
                    Individual TVRs available by PEN
                    <span class="icon-container ml-1">
                      <i class="mdi mdi-tray-arrow-down" />
                    </span>
                  </a>
                </li>
              </ul>
              <h3>Graduation Projections Summary Reports ({{ currentStartMoYr }} to {{ currentEndMoYr }})</h3>
              <ul>
                <li>
                  <a
                    href=""
                    class="link-style"
                  >
                    Projected Non-Graduates - Summary Report
                    <span class="icon-container ml-1">
                      <i class="mdi mdi-tray-arrow-down" />
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    href=""
                    class="link-style"
                  >
                    Projected Graduates - Summary Report
                    <span class="icon-container ml-1">
                      <i class="mdi mdi-tray-arrow-down" />
                    </span>
                  </a>
                </li>
              </ul>

              <h3>Historical Graduation Projected Summary Reports ({{ histStartMoYr }} to {{ histEndMoYr }})</h3>
              <ul>
                <li>
                  <a
                    href=""
                    class="link-style"
                  >
                    Projected Non-Graduates - Summary Report
                    <span class="icon-container ml-1">
                      <i class="mdi mdi-tray-arrow-down" />
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    href=""
                    class="link-style"
                  >
                    Projected Graduates - Summary Report
                    <span class="icon-container ml-1">
                      <i class="mdi mdi-tray-arrow-down" />
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
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
import {generateGradStartAndEndDateStrings} from '../../../../utils/common';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import {penIsValid} from '../../../../utils/institute/formRules';
import ApiService from '../../../../common/apiService';
import {ApiRoutes, MINISTRY_NAME} from '../../../../utils/constants';
import {isValidPEN} from '../../../../utils/validation';
import PENSearchDialog from '../../PENSearchDialog.vue';
import {appStore} from '../../../../store/modules/app';
import {mapState} from 'pinia';

export default {
  name: 'GradProjectionsTVR',
  components: {
    PENSearchDialog,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    districtID: {
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
      schoolsCacheMap: null,
      schoolCodeNameFilter: null,
      filterSearchParams: null,
      schoolSearchNames: [],
      headerSearchParams: {
        schoolNumber: '',
        status: '',
        category: '',
        type: ''
      },
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap']),
  },
  watch: {

  },
  async created() {
    this.populateDateRanges();
    appStore().getInstitutesData().finally(() => {
      this.schoolsCacheMap = this.schoolsMap;
      this.getSchoolDropDownItems();
    });
  },
  beforeUnmount() {

  },
  methods: {
    penIsValid,
    backButtonClick() {
      this.$router.push({name: 'graduation', params: {instituteIdentifierID: this.districtID}});
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

      ApiService.apiAxios.get(ApiRoutes.studentRequest.SEARCH_URL + 'search-grad-pen', {
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
    getSchoolDropDownItems() {
      this.schoolSearchNames = [];
      let now = new Date();
      let currentSchoolYearStart, currentSchoolYearEnd;
      if (now.getMonth() >= 6) {
        currentSchoolYearStart = new Date(now.getFullYear(), 6, 1); // July 1 of this year
        currentSchoolYearEnd = new Date(now.getFullYear() + 1, 5, 30); // June 30 of next year
      } else {
        currentSchoolYearStart = new Date(now.getFullYear() - 1, 6, 1); // July 1 of last year
        currentSchoolYearEnd = new Date(now.getFullYear(), 5, 30); // June 30 of this year
      }
      const windowStart = new Date(currentSchoolYearStart.getFullYear() - 2, currentSchoolYearStart.getMonth(), currentSchoolYearStart.getDate());
      const windowEnd = currentSchoolYearEnd;
      this.schoolsCacheMap.forEach(school => {
        if (school.districtID === this.districtID && school.schoolCategoryCode === 'PUBLIC' && school.canIssueTranscripts === true) {
          if (!school.effectiveDate) {
            return;
          }
          let schoolOpened = new Date(school.effectiveDate);
          let schoolClosed = school.expiryDate ? new Date(school.expiryDate) : null;
          if (schoolOpened <= windowEnd && (!schoolClosed || schoolClosed >= windowStart)) {
            let schoolItem = {
              schoolCodeName: school.mincode + ' - ' + school.schoolName,
              schoolID: school.schoolID,
            };
            this.schoolSearchNames.push(schoolItem);
          }
        }
      });
    },
    searchButtonClick() {
      if(this.schoolCodeNameFilter !== null && this.schoolCodeNameFilter!== '') {
        this.headerSearchParams.schoolID = this.schoolCodeNameFilter;
      }else{
        this.headerSearchParams.schoolID = '';
      }
      // TODO - do something with this search, populate the correct download links for the selected school
    },
    handleDistrictReportsDivClick() {
      if (!this.schoolCodeNameFilter) {
        this.setWarningAlert('Please select a school');
      }
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

.disabled-section {
  opacity: 0.5;
  pointer-events: none;
}
</style>

