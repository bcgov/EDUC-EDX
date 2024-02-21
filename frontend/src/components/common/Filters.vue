<template>
  <v-card class="filter-card">
    <v-card-title class="sheetHeader pt-1 pb-1">
      Filters
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row justify="space-between">
        <v-col cols="4">
          <a
            id="clear-filter"
            @click="clear()"
          >Clear All Filters</a>
        </v-col>
        <v-col
          cols="4"
          style="text-align: end;"
        >
          <a
            id="apply-filter"
            @click="apply()"
          >Apply Filters</a>
        </v-col>
      </v-row>
      <div
        v-for="(filter, index) in filters"
        :key="index"
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
            v-model="selected[index]"
            color="#003366"
            rounded="0" 
            :multiple="filter?.multiple"
            class="filter-toggle"
            @update:model-value="setFilter(selected[index], filter?.key)"
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
          <v-col v-if="filter?.key === 'bandCode'">
            <v-autocomplete
              id="bandCode"
              v-model="bandCodeValue"
              label="Band of Residence"
              density="compact"
              variant="underlined"
              :items="sdcCollection.bandCodes"
              item-value="bandCode"
              item-title="dropdownText"
              class="mt-n7 mb-n8"
              clearable
              @update:model-value="setBandCodeFilter('bandResidence', $event)"
            />
          </v-col>
          <v-col v-if="filter?.key === 'courses'">
            <v-range-slider
              id="courses-slider"
              v-model="courseRange"
              :min="courseRangeDefault[0]"
              :max="courseRangeDefault[1]"
              :step="1"
              color="#003366"
              hide-details
              strict
              thumb-size="15"
              class="align-center"
              @update:model-value="setCourseRangeFilter('numberOfCoursesDec', $event)"
            >
              <template #prepend>
                <v-text-field
                  v-model="courseRange[0]"
                  hide-details
                  single-line
                  type="number"
                  :step="1"
                  :min="courseRangeDefault[0]"
                  :max="courseRange[1]"
                  variant="outlined"
                  density="compact"
                  class="slider-text"
                  :readonly="true"
                  @update:model-value="setCourseRangeFilter('numberOfCoursesDec', courseRange)"
                />
              </template>
              <template #append>
                <v-text-field
                  v-model="courseRange[1]"
                  hide-details
                  single-line
                  type="number"
                  :min="courseRange[0]"
                  :max="courseRangeDefault[1]"
                  variant="outlined"
                  density="compact"
                  class="slider-text"
                  :readonly="true"
                  @update:model-value="setCourseRangeFilter('numberOfCoursesDec', courseRange)"
                />
              </template>
            </v-range-slider>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>
  
<script>
import alertMixin from '../../mixins/alertMixin';
import { sdcCollectionStore } from '../../store/modules/sdcCollection';
import {isEmpty} from 'lodash';
  
export default {
  name: 'Filters',
  components: {
  },
  mixins: [alertMixin],
  props: {
    filters: {
      type: Array,
      required: true,
      default: null
    },
    school: {
      type: Object,
      required: true,
      default: null
    },
    updatedFilters: {
      type: Object,
      required: true,
      default: null 
    }
  },
  emits: ['closeFilters', 'clearFilters'],
  data() {
    return {
      selected:[],
      selectedFilters: {},
      bandCodeValue: null,
      sdcCollection: sdcCollectionStore(),
      courseRangeDefault: [0, 15],
      courseRange: [0, 15]
    };
  },
  computed: {
     
  },
  watch: {
    updatedFilters: {
      handler(toRemoveFilters) {
        if(Object.keys(toRemoveFilters).length !== 0) {
          delete this.selectedFilters[toRemoveFilters.removeKey];
          let filteredKey = this.selected.find(value => value && Array.isArray(value) && value.find(obj => obj.title === toRemoveFilters.removeValue));
          if(toRemoveFilters.removeKey === 'bandResidence') {
            this.bandCodeValue = null;
          } else if (toRemoveFilters.removeKey === 'numberOfCoursesDec') {
            this.courseRange = [...this.courseRangeDefault];
          } else if(filteredKey === undefined) {
            const idx = this.selected.findIndex(value => value && !Array.isArray(value) && (value.title === toRemoveFilters.removeValue));
            this.selected.splice(idx, 1, null);
          } else {
            this.selected.map(filter => {
              if(Array.isArray(filter) && filter.every(val => filteredKey.includes(val))) {
                filter.splice(filter.findIndex(value => value.title === toRemoveFilters.removeValue), 1);
              }
            });
          }
        } else {
          this.clear();
        }      
      },
      immediate: true
    }
  },
  methods: {
    setFilter(val, key) {
      if(val && !isEmpty(val)) {
        this.selectedFilters[key] = this.setFilterValue(key, val);
      } else {
        delete this.selectedFilters[key];
      }
    },
    setBandCodeFilter(key, $event){
      if($event) {
        this.selectedFilters[key] = [{title: this.sdcCollection.bandCodes.find(value => value.bandCode === $event).dropdownText, value: $event}];
      } else {
        delete this.selectedFilters[key];
      }
    },
    setCourseRangeFilter(key, $event){
      if($event) {
        let courseFilterTitle;
        if($event[0] === this.courseRangeDefault[0]){
          courseFilterTitle = + $event[1] + ' courses or less';
        } else if ($event[1] === this.courseRangeDefault[1]) {
          courseFilterTitle = $event[0] + ' courses or more';
        } else {
          courseFilterTitle = 'Between ' + $event[0] + ' and ' + $event[1] + ' courses';
        }
        this.selectedFilters[key] = [{title: courseFilterTitle, value: $event}];
      } else {
        delete this.selectedFilters[key];
      }
    },
    clear() {
      this.selected = [];
      this.selectedFilters = {};
      this.bandCodeValue = null;
      this.courseRange = [...this.courseRangeDefault];
      this.$emit('clearFilters');
    },
    apply() {
      const filtersToCheck = Object.entries(this.selectedFilters).map(([key, value]) => ({ key, value }));
      this.$emit('closeFilters', filtersToCheck);
    },
    setFilterValue(key, val) {
      return key === 'support' || key === 'careerProgramsFunding' || key === 'frenchFunding' || key === 'indigenousProgramsFunding' || key === 'ancestry' || key === 'spedFunding' || key === 'ellFunding' ? [val] : val;
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
    
    
  
