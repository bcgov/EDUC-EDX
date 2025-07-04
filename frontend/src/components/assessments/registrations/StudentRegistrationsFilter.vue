<template>
  <v-card class="filter-card">
    <v-card-title class="sheetHeader pt-1 pb-1">
      <v-row no-gutters>
        <v-col class="d-flex justify-start"> Filters </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="close()"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col class="d-flex justify-start">
          <PrimaryButton
            id="applyPenLocalIdNameFilter"
            large-icon
            icon="mdi-magnify"
            text="Search Name and ID"
            :click-action="($event) => setPenLocalIdNameFilter($event, 'click')"
          />
        </v-col>
        <v-col class="d-flex justify-end">
          <PrimaryButton
            id="clear-filter"
            secondary
            large-icon
            icon="mdi-filter-off-outline"
            text="Clear All"
            :click-action="clear"
          />
        </v-col>
      </v-row>
      <div >
        <v-row class="d-flex justify-space-around">
          <v-col id="searchFiltering" class="filter-heading pb-0">
            <span>Name and ID</span>
            <v-tooltip content-class="customTooltip">
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  v-bind="tooltipProps"
                  size="25"
                  color="#003366"
                  style="align-self: center; margin-left: 0.2rem"
                >
                  mdi-help-circle
                </v-icon>
              </template>
              <span id="penLocalIdNameFilterTooltip">
                The search button must be used to apply changes to PEN or Local
                ID or Name searches. All other filters will apply on change
                without use of the search button.
              </span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-0" cols="6">
            <v-text-field
              id="pen"
              v-model="pen"
              label="PEN"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col class="py-0" cols="6">
            <v-text-field
              id="localID"
              v-model="localID"
              label="Local ID"
              color="primary"
              variant="underlined"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-0" cols="6">
            <v-text-field
              id="givenName"
              v-model="givenName"
              label="First Name"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col class="py-0" cols="6">
            <v-text-field
              id="surName"
              v-model="surName"
              label="Last Name"
              color="primary"
              variant="underlined"
            />
          </v-col>
        </v-row>
      </div>
      <div>
        <v-row v-if="userInfo.activeInstituteType === 'DISTRICT'">
          <v-col cols="12" class="pt-0">
            <slot name="text-search">              
              <v-autocomplete
                id="selectSchool"
                v-model="schoolNameNumberFilter"
                variant="underlined"
                :items="schoolSearchNames"
                color="#003366"
                label="School Name or Number"
                single-line
                :clearable="true"
                item-title="schoolCodeName"
                item-value="schoolCodeValue"
                autocomplete="off"
                @update:model-value="
                  setSchoolNameNumberFilter('schoolNameNumber', $event)
                "
              />
            </slot>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <slot name="text-search">              
              <v-autocomplete
                id="selectSchool"
                v-model="assessmentCenterNameNumberFilter"
                variant="underlined"
                :items="assessmentCenterSearchNames"
                color="#003366"
                label="Assessment Center Name or Number"
                single-line
                :clearable="true"
                item-title="schoolCodeName"
                item-value="schoolCodeValue"
                autocomplete="off"
                @update:model-value="
                  setAssessmentCenterNameNumberFilter('assessmentCenterNameNumber', $event)
                "
              />
            </slot>
          </v-col>
        </v-row>
      </div>
      <div v-for="(filter, key) in filters" :key="key">
        <v-row v-if="filter?.heading">
          <v-col :id="filter.id" class="filter-heading">
            {{ filter?.heading }}
          </v-col>
        </v-row>
        <v-row v-else class="filter-heading"/>
        <v-row>
          <v-btn-toggle
            v-model="selected[key]"
            color="#003366"
            rounded="0"
            :multiple="filter?.multiple"
            class="filter-toggle"
            @update:model-value="setFilter(selected[key], key)"            
          >
            <div v-if="filter?.id === 'sessionTypeCode'">
              <span 
                v-for="(option, i) in sessionSearchNames" 
                :key="option.value"
              >
                <v-btn
                  :id="option?.id"
                  :value="option"
                  :class="selected['session']?.find(entry => entry.id === option.id) ? 'filter-button-active' : 'filter-button'"
                  rounded="lg"
                >
                  {{ option?.title }}
                </v-btn>
              </span>
            </div>
            <div v-else-if="filter?.id === 'assessmentTypeCode'">
              <span 
                v-for="(option, i) in assessmentTypeSearchNames"
                :key="option.value"
              >
                <v-btn
                  :id="option?.id"
                  :value="option"
                  class="filter-button"
                  rounded="lg"
                >
                  {{ option?.title }}
                </v-btn>
              </span>
            </div>     
            <div v-else-if="filter?.id === 'proficiencyScoreValue'">

              <span 
                v-for="(option, i) in filter?.filterOptions" 
                :key="option.value"
              >
                <v-btn
                  :id="option?.id"
                  :value="option"
                  class="filter-button"
                  rounded="lg"
                >
                  {{ option?.title }}
                </v-btn>
              </span>

              <span 
                v-for="(option, i) in specialCaseSearchNames"
                :key="option.value"
              >
                <v-btn
                  :id="option?.id"
                  :value="option"
                  class="filter-button"
                  rounded="lg"
                >
                  {{ option?.title }}
                </v-btn>
              </span>
            </div>        
            <div v-else>
              <span 
                v-for="(option, i) in filter?.filterOptions" 
                :key="option.value"
              >
                <v-btn
                  :id="option?.id"
                  :value="option"
                  class="filter-button"
                  rounded="lg"
                >
                  {{ option?.title }}
                </v-btn>
              </span>
            </div>   
          </v-btn-toggle>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import { isEmpty, sortBy, capitalize} from 'lodash';
import { mapState } from 'pinia';
import {appStore} from '../../../store/modules/app';
import {authStore} from '../../../store/modules/auth';
import {easStore} from '../../../store/modules/eas';
import { Month } from '@js-joda/core';

export default {
  name: 'StudentRegistrationsFilter',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    filters: {
      type: Object,
      required: true,
      default: null,
    },
    schoolYearSessions: {
      type: Object,
      required: true,
      default: null,
    },
    initialFilterSelection: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: ['clear-assessment-filters', 'apply-assessment-filters', 'close-assessment-filter'],
  data() {
    return {
      selected: {},
      scoreRangeDefault: [0, 4],
      scoreRange: [0, 4],
      givenName: null,
      surName: null,
      pen: null,
      localID: null,
      schoolSearchNames: [],
      assessmentCenterSearchNames: [],
      sessionSearchNames: [],
      assessmentTypeSearchNames: [],      
      specialCaseSearchNames: [],
      schoolNameNumberFilter: null,
      assessmentCenterNameNumberFilter: null,
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap', 'config']),
    ...mapState(authStore, ['userInfo']),   
    ...mapState(easStore, ['specialCaseCodes']) 
  },
  watch: {},
  async beforeMount() {
    this.selected = {...this.initialFilterSelection};
    if (this.schoolsMap.size === 0) {
      await appStore().getInstitutesData();
    }    
  },
  created() {
    authStore()
      .getUserInfo()
      .then(() => {
        appStore()
          .getInstitutesData()
          .then(() => {
            if(this.userInfo.activeInstituteType === 'DISTRICT'){
              this.setupSchoolLists();
            }
            this.loading = false;
          });
        easStore()
          .getSpecialCaseCodes()
          .then(() => {            
            this.setupSpecialCaseCodes();     
            this.loading = false;
          });
      });
    Object.keys(this.filters).forEach((key) => {
      this.selected[key] = [];
    });   
    this.setupAssessmentSessions(); 
  },
  methods: {  
    close() {
      this.$emit('close-assessment-filter');
    },
    setupAssessmentSessions() {
      this.sessionSearchNames = [];
      this.assessmentTypeSearchNames = [];
      this.schoolYearSessions.forEach(session => {
        this.sessionSearchNames.push({
          id: session.sessionID,
          courseMonth: parseInt(session.courseMonth),
          courseYear: parseInt(session.courseYear),
          title: this.formatMonth(session.courseMonth),
          value: session.sessionID
        });
        session.assessments.forEach(assessment => {
          let existingItem = this.assessmentTypeSearchNames.find(item => item.id === assessment.assessmentTypeCode);
          if (!existingItem) {
            this.assessmentTypeSearchNames.push({title: assessment.assessmentTypeCode, id: assessment.assessmentTypeCode, value: assessment.assessmentTypeCode, displayOrder: assessment.displayOrder});
          }
        });
      });
      this.sessionSearchNames = sortBy(this.sessionSearchNames, ['courseYear','courseMonth']); 
      this.assessmentTypeSearchNames = sortBy(this.assessmentTypeSearchNames, ['displayOrder']); 
    },
    setupSpecialCaseCodes() {
      this.specialCaseSearchNames = [];
      Object.keys(this.specialCaseCodes).forEach(key => {
        this.specialCaseSearchNames.push({title: this.specialCaseCodes[key], id: key, value: key});
      });
      this.specialCaseSearchNames.push({title: 'No Result', id: 'noResults', value: 'false'});
      this.specialCaseSearchNames = sortBy(this.specialCaseSearchNames, ['id']); 
    },
    setupSchoolLists() {
      this.schoolSearchNames = [];
      this.assessmentCenterSearchNames = [];
      this.schoolsMap?.forEach((school) => {
        let schoolCodeName = school.schoolName + ' - ' + school.mincode;

        this.assessmentCenterSearchNames.push({schoolCodeName: schoolCodeName, schoolCodeValue: school.schoolID});

        if(school.districtID === this.userInfo.activeInstituteIdentifier) {
          this.schoolSearchNames.push({schoolCodeName: schoolCodeName, schoolCodeValue: school.schoolID});
        }
      });
      this.schoolSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
      this.assessmentCenterSearchNames = sortBy(this.assessmentCenterSearchNames, ['schoolCodeName']);
    },
    setPenLocalIdNameFilter($event, val) {
      const keys = ['givenName', 'surName', 'pen', 'localID'];
      keys.forEach((key) => {
        if (this[key] != null) {
          if (this[key].length > 0) {
            this.selected[key] = [{ title: key, value: this[key] }];
          } else {
            delete this.selected[key];
          }
        }
      });
      if ($event && val === 'click') {
        this.apply();
      }
    },    
    setSchoolNameNumberFilter(key, $event) {
      this.setPenLocalIdNameFilter($event, null);
      if ($event) {
        this.selected[key] = [{ title: 'SchoolNameOrNumber', value: $event }];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setAssessmentCenterNameNumberFilter(key, $event) {
      this.setPenLocalIdNameFilter($event, null);
      if ($event) {
        this.selected[key] = [{ title: 'AssessmentCenterNameOrNumber', value: $event }];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setFilter(val, key) {
      this.setPenLocalIdNameFilter(null, null);
      if (val && !isEmpty(val)) {
        this.selected[key] = Array.isArray(val) ? val : [val];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    clear() {
      this.selected = {};
      this.penLocalIdNameFilter = null;
      this.schoolNameNumberFilter = null;
      this.assessmentCenterNameNumberFilter = null;
      this.givenName = null;
      this.surName = null;
      this.pen = null;
      this.localID = null;
      this.scoreRange = [...this.scoreRangeDefault];
      this.$emit('clear-assessment-filters');
    },
    apply() {
      this.$emit('apply-assessment-filters', this.selected);
    },
    formatMonth(month) {
      return capitalize(Month.of(month).toString());
    }
  },
};
</script>

<style scoped>
.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.filter-heading {
  font-weight: bold;
  color: #003366;
  margin-top: 1em;
}
.filter-card {
      height: 100%;
      overflow-y: auto;
    }
.filter-button {
  color: #003366;
  padding: 5px;
  margin: 0 8px 8px 8px;
  border: 1px solid #003366;
}

.filter-button-active {
padding: 5px;
margin: 0 8px 8px 8px; 
background-color: rgb(0, 51, 102); 
color: rgb(255, 255, 255); 
caret-color: rgb(255, 255, 255);
}

.filter-toggle {
  flex-wrap: wrap !important;
  overflow: visible !important;
  height: auto !important;
}

</style>
