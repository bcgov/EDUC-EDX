<template>
  <v-card class="filter-card">
    <v-card-title class="sheetHeader pt-1 pb-1">
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Filters
        </v-col>
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
        <v-col>
          <PrimaryButton
            id="applyPenLocalIdNameFilter"
            large-icon
            icon="mdi-magnify"
            text="Search Name and ID"
            :click-action="setPenLocalIdNameFilter"
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

      <div>
        <v-row class="d-flex justify-space-around">
          <v-col
            id="searchFiltering"
            class="filter-heading pb-0"
          >
            <span>Name and ID</span>
            <v-tooltip content-class="customTooltip">
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  v-bind="tooltipProps"
                  size="25"
                  color="#003366"
                  style="align-self: center; margin-left: .2rem"
                >
                  mdi-help-circle
                </v-icon>
              </template>
              <span id="penLocalIdNameFilterTooltip">
                The search button must be used to apply changes to PEN or Local ID or Name searches. All other filters will apply on change without use of the search button.
              </span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            class="py-0"
            cols="6"
          >
            <v-text-field
              id="searchInput"
              v-model="firstName"
              label="First Name"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col
            class="py-0"
            cols="6"
          >
            <v-text-field
              id="searchInput"
              v-model="lastName"
              label="Last Name"
              color="primary"
              variant="underlined"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            class="py-0"
            cols="6"
          >
            <v-text-field
              id="searchInput"
              v-model="pen"
              label="PEN"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col
            class="py-0"
            cols="6"
          >
            <v-text-field
              id="searchInput"
              v-model="localID"
              label="Local ID"
              color="primary"
              variant="underlined"
            />
          </v-col>
        </v-row>
      </div>
      <div
        v-for="(filter, key) in filters"
        :key="key"
      >
        <v-row>
          <v-col
            :id="filter.id"
            class="filter-heading"
          >
            {{ filter?.heading }}
          </v-col>
        </v-row>
        <v-row>
          <v-btn-toggle
            v-model="selected[key]"
            color="#003366"
            rounded="0"
            :multiple="filter?.multiple"
            class="filter-toggle"
            @update:model-value="setFilter(selected[key], key)"
          >
            <div
              v-for="(option, i) in filter?.filterOptions"
              :key="i"
            >
              <v-btn
                :id="option?.id"
                :value="option"
                class="filter-button"
                rounded="lg"
              >
                {{ option?.title }}
              </v-btn>
            </div>
          </v-btn-toggle>
        </v-row>
      </div>
      <div v-if="showFileTypeAndErrorWarnFields">
        <v-row>
          <v-col
            class="filter-heading"
          >
            File Type
          </v-col>
        </v-row>
        <v-row>
          <v-btn-toggle
            v-model="demCrsXamSelector"
            color="#003366"
            rounded="0"
            class="filter-toggle"
            @update:model-value="setFileTypeFilter('fileType', $event)"
          >
            <div>
              <v-btn
                id="demFileType"
                value="DEM-ERROR"
                class="filter-button"
                rounded="lg"
              >
                DEM
              </v-btn>
            </div>
            <div>
              <v-btn
                id="crsFileType"
                value="CRS-ERROR"
                class="filter-button"
                rounded="lg"
              >
                CRS
              </v-btn>
            </div>
            <div>
              <v-btn
                id="xamFileType"
                value="XAM-ERROR"
                class="filter-button"
                rounded="lg"
              >
                XAM
              </v-btn>
            </div>
          </v-btn-toggle>
        </v-row>
      </div>
      <div v-if="showFileTypeAndErrorWarnFields">
        <v-row>
          <v-col
            class="filter-heading"
          >
            Errors/Warnings
          </v-col>
        </v-row>
        <v-row>
          <v-btn-toggle
            v-model="errorWarnSelector"
            :disabled="demCrsXamSelector == null"
            color="#003366"
            rounded="0"
            multiple
            class="filter-toggle"
            @update:model-value="setErrorWarningFilter('warnings', $event)"
          >
            <div>
              <v-btn
                id="errorSelect"
                value="ERROR"
                class="filter-button"
                rounded="lg"
              >
                Has Errors
              </v-btn>
            </div>
            <div>
              <v-btn
                id="warnSelect"
                value="WARNING"
                class="filter-button"
                rounded="lg"
              >
                Has Warnings
              </v-btn>
            </div>
          </v-btn-toggle>
        </v-row>
      </div>
      <div v-if="showProgramField">
        <v-row>
          <v-col cols="8">
            <v-autocomplete
              id="errorField"
              v-model="errorFieldValue"
              label="Program"
              variant="underlined"
              :items="programCodes"
              item-value="programCode"
              item-title="programName"
              clearable
              @update:model-value="setProgramCodeFilter('programCode', $event)"
            />
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>
    
<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
import { gdcStore } from '../../store/modules/gdc';
import {isEmpty} from 'lodash';
import {orderBy} from 'lodash/collection';
    
export default {
  name: 'GradErrorFilters',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    filters: {
      type: Object,
      required: true,
      default: null
    },
    showProgramField: {
      type: Boolean,
      required: false,
      default: false
    },
    showFileTypeAndErrorWarnFields: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['clearFilters', 'apply-filters', 'close'],
  data() {
    return {
      selected: {},
      pen: null,
      errorWarnSelector: null,
      errorSelector: null,
      warnSelector: null,
      demCrsXamSelector: null,
      demSelector: null,
      crsSelector: null,
      xamSelector: null,
      localID: null,
      programCodes: [],
      firstName: null,
      lastName: null,
      penLocalIdNameFilter: null,
      errorFieldValue: null,
      gdcStore: gdcStore(),
    };
  },
  computed: {
  },
  created() {
    Object.keys(this.filters).forEach(key => {
      this.selected[key] = [];
    });
    if(this.showProgramField){
      gdcStore().getGradProgramCodes().then(() => {
        this.programCodes = this.gdcStore.gradProgramCodes;
        this.programCodes.forEach(prog => {
          prog.programName = prog.programName + ' (' + prog.programCode + ')';
        });
        this.programCodes = orderBy(this.gdcStore.gradProgramCodes, ['expiryDate', 'programName'], ['desc','asc']);
      });
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    setPenLocalIdNameFilter() {
      const keys = ['firstName', 'lastName', 'pen', 'localID'];
      keys.forEach(key => {
        if (this[key] != null) {
          if (this[key].length > 0) {
            this.selected[key] = [{ title: key, value: this[key] }];
          } else {
            delete this.selected[key];
          }
        }
      });
      this.apply();
    },
    setFilter(val, key) {
      if(val && !isEmpty(val)) {
        this.selected[key] = (Array.isArray(val) ? val : [val]);
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setFieldCodeFilter(key, $event){
      if($event) {
        this.selected[key] = [{title: this.gdcStore.validationFieldCode.find(value => value.code === $event).description, value: $event}];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setProgramCodeFilter(key, $event){
      if($event) {
        this.selected[key] = [{title: 'programCode', value: $event}];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setFileTypeFilter(key, $event){
      if($event) {
        this.selected[key] = [{title: 'fileType', value: $event}];
        this.apply();
      } else {
        this.errorWarnSelector = null;
        delete this.selected[key];
        delete this.selected['warnings'];
        this.apply();
      }
    },
    setErrorWarningFilter(key, $event){
      if($event && ($event.includes('ERROR') || $event.includes('WARNING'))) {
        this.selected[key] = [{title: 'warnings', value: $event}];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    clear() {
      this.selected = {};
      this.pen = null;
      this.localID = null;
      this.firstName = null;
      this.lastName = null;
      this.penLocalIdNameFilter = null;
      this.errorFieldValue = null;
      this.$emit('clearFilters');
    },
    apply() {
      this.$emit('apply-filters', this.selected);
    }
  }
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
  
    .filter-button {
      color: #003366;
      padding: 5px;
      margin: 0px 8px 8px 8px;
      border: 1px solid #003366;
    }
  
    .filter-card {
      height: 100%;
      overflow-y: auto;
    }
  
    .filter-toggle {
      flex-wrap: wrap !important;
      overflow: visible !important;
      height: auto !important;
    }
  
    #courses-slider {
      margin: 0px 8px 8px 8px;
    }
  
    .slider-text {
      width: 5em;
      font-size: 0.875rem;
      border-color: #003366;
    }
    </style>
      
      
    
  
