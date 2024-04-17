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
            id="close"
            @click="close()"
          >Cancel</a>
        </v-col>
        <v-col
          cols="4"
          style="text-align: end;"
        >
          <PrimaryButton
            id="clear-filter"
            secondary
            large-icon
            icon="mdi-filter-off-outline"
            text="Clear"
            :click-action="clear"
            class="mt-n1"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <slot
            name="text-search"
            :filter="setSearchFilter"
          >
            <v-text-field
              id="searchInput"
              v-model="penLocalIdNameFilter"
              label="PEN or Local ID or Name"
              color="primary"
              variant="underlined"
              class="mt-n4 mb-n4"
              @update:model-value="setPenLocalIdNameFilter('penLocalIdName', $event)"
            />
          </slot>
        </v-col>
      </v-row>
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
                variant="outlined"
              >
                {{ option?.title }}
              </v-btn>
            </div>
          </v-btn-toggle>
          <v-col v-if="key === 'bandCode'">
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
          <v-col v-if="key === 'courses'">
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
              @end="setCourseRangeFilter('numberOfCoursesDec', $event)"
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
import PrimaryButton from '../util/PrimaryButton.vue';
import {isEmpty} from 'lodash';
  
export default {
  name: 'Filters',
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
    school: {
      type: Object,
      required: false,
      default: null
    }
  },
  emits: ['clearFilters', 'apply-filters', 'close'],
  data() {
    return {
      selected: {},
      bandCodeValue: null,
      sdcCollection: sdcCollectionStore(),
      courseRangeDefault: [0, 15],
      courseRange: [0, 15],
      penLocalIdNameFilter: null
    };
  },
  watch: {
  },
  created() {
    Object.keys(this.filters).forEach(key => {
      this.selected[key] = {};
    });
  },
  methods: {
    close() {
      this.$emit('close');
    },
    setPenLocalIdNameFilter(key, $event) {
      if($event) {
        this.selected[key] = [{title: 'PenOrLocalIdOrName', value: $event}];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
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
    setBandCodeFilter(key, $event){
      if($event) {
        this.selected[key] = [{title: this.sdcCollection.bandCodes.find(value => value.bandCode === $event).dropdownText, value: $event}];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
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
        this.selected[key] = [{title: courseFilterTitle, value: $event}];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    clear() {
      this.selected = {};
      this.bandCodeValue = null;
      this.courseRange = [...this.courseRangeDefault];
      this.penLocalIdNameFilter = null;
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
    
    
  
