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
          <a @click="close()">Close</a>
        </v-col>
      </v-row>
            
      <div
        v-for="(filter, index) in filters"
        :key="index"
      >
        <v-row>
          <v-col class="filter-heading">
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
            @update:model-value="setFilter(selected[index], filter?.key, index)"
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
              >
                {{ option?.title }}
              </v-btn>
            </div>
          </v-btn-toggle>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>
  
<script>
import alertMixin from '../../mixins/alertMixin';
  
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
  emits: ['closeFilters'],
  data() {
    return {
      selected:[],
      gradeFilter: null,
      fundingFilter: null,
      warningFilter: null,
      studentTypeFilter: null,
      fteFilter: null,
      supportBlockFilter: null,
      fteZeroFilter: null
    };
  },
  computed: {
     
  },
  watch: {
    updatedFilters: {
      handler(value) {
        if(value.length > 0) {
          this.clear();  
          for(let filter of value) {
            this.selected[filter.index] = filter.value;
            if(filter.key === 'support') {
              this.setFilter(filter.value[0], filter.key, filter.index);
            } else {
              this.setFilter(filter.value, filter.key, filter.index);
            }
          }
        } else {
          this.clear();
        }
      },
      immediate: true
    }
  },
  created() {
    
  },
  methods: {
    setFilter(val, key, index) {
      switch(key) {
      case 'studentType':
        this.studentTypeFilter = {key: key, value: val, index: index};
        break;
      case 'fte':
        this.fteFilter = {key: key, value: val, index: index};
        break;
      case 'grade':
        this.gradeFilter = {key: key, value: val, index: index};
        break;
      case 'fundingType':
        this.fundingFilter = {key: key, value: val, index: index};
        break;
      case 'warnings':
        this.warningFilter = {key: key, value: val, index: index};
        break;
      case 'support':
        this.supportBlockFilter = {key: key, value: [val], index: index};
        break;
      case 'fteZero':
        this.fteZeroFilter = {key: key, value: val, index: index};
        break;
      default:
        break;
      }
    },
    clear() {
      this.selected=[];
      this.gradeFilter=null;
      this.fundingFilter=null;
      this.warningFilter=null;
      this.studentTypeFilter=null;
      this.fteFilter=null;
      this.supportBlockFilter=null;
      this.fteZeroFilter=null;
    },
    close() {
      let filters = [];
      const filtersToCheck = [this.studentTypeFilter, this.fteFilter, this.warningFilter, this.fundingFilter, this.gradeFilter, this.supportBlockFilter, this.fteZeroFilter];
      filters = filtersToCheck.filter(f => f?.value?.length > 0);
      this.$emit('closeFilters', filters);
    },
    isVisible(key, value){
      if(key === 'fteZero' && (value === 'INDYADULT' || value === 'AUTHDUP')) {
        return (this.school?.schoolCategory === 'INDEPEND' || this.school?.schoolCategory === 'INDP_FNS');
      } else if(key === 'fteZero' && (value === 'INACTIVE' || value === 'DISTDUP')) {
        return (this.school?.facilityTypeCode === 'CONT_ED' || this.school?.facilityTypeCode === 'DIST_LEARN' || this.school?.facilityTypeCode === 'DISTONLINE');
      }
      return true;
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

  .filter-card {
    height: 100%;
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
    
    
  
