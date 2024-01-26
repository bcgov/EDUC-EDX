<template>
  <v-card class="filter-card">
    <v-card-title class="sheetHeader pt-1 pb-1">
      Filters
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row justify="space-between">
        <v-col cols="4">
          <a @click="clear()">Clear All Filters</a>
        </v-col>
        <v-col
          cols="4"
          style="text-align: end;"
        >
          <a @click="apply()">Apply Filters</a>
        </v-col>
      </v-row>
      <div
        v-for="(filterGroups, index) in filters"
        :key="index"
      >
        <v-row>
          <v-col :id="filterGroups.id" class="filter-heading">
            {{ filterGroups?.heading }}
          </v-col>
        </v-row>
        <v-row
          v-for="(filter, idx) in filterGroups?.filterGroups"
          :key="filter.key"
        >
          <v-btn-toggle
            v-model="selected[index][idx]"
            color="#003366"
            rounded="0" 
            :multiple="filter?.multiple"
            class="filter-toggle"
            @update:model-value="setFilter(selected[index][idx], filter?.key)"
          >
            <div
              v-for="(option, i) in filter?.filterOptions"
              :key="i"
            >
              <v-btn
                v-if="isVisible(filter?.key, option?.value)"
                :value="option"
                class="filter-button"
                rounded="lg"
                :id="option?.id"
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
              @update:model-value="setBandCodeFilter('bandResidence', $event, )"
            />
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
      type: Array,
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
    };
  },
  computed: {
     
  },
  watch: {
    updatedFilters: {
      handler(currentFilters) {
        if(currentFilters.length > 0) {
          this.selected.forEach(innerArrays => {
            innerArrays.forEach((innerArray, index) => {
              if (innerArray.length > 0) {
                innerArrays[index] = innerArray.filter(item => {
                  return currentFilters.some(obj1 => {
                    const valuesToKeep = obj1.value.map(val => val.value);
                    return valuesToKeep.includes(item.value);
                  });
                });
              }
            });
          });
          Object.keys(this.selectedFilters).forEach(key => {
            const valuesToKeep = currentFilters.find(item => item.key === key)?.value.map(val => val.value) || [];
            this.selectedFilters[key] = this.selectedFilters[key].filter(item => valuesToKeep.includes(item.value));
          });
        } else {
          this.clear();
        }
      },
      immediate: true
    }
  },
  created() {
    this.selected = this.filters.map(filterGroup =>
      filterGroup.filterGroups?.map(()=>[])
    );
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
    clear() {
      this.selected = this.filters.map(filterGroup =>
        filterGroup.filterGroups?.map(()=>[])
      );
      this.selectedFilters = {};
      this.bandCodeValue = null;
      this.$emit('clearFilters');
    },
    apply() {
      const filtersToCheck = Object.entries(this.selectedFilters).map(([key, value]) => ({ key, value }));
      this.$emit('closeFilters', filtersToCheck);
    },
    isVisible(key, value){
      if(key === 'fteZero' && (value === 'INDYADULT' || value === 'AUTHDUP')) {
        return (this.school?.schoolCategory === 'INDEPEND' || this.school?.schoolCategory === 'INDP_FNS');
      } else if(key === 'fteZero' && (value === 'INACTIVE' || value === 'DISTDUP')) {
        return (this.school?.facilityTypeCode === 'CONT_ED' || this.school?.facilityTypeCode === 'DIST_LEARN' || this.school?.facilityTypeCode === 'DISTONLINE');
      }
      return true;
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
  </style>
    
    
  
