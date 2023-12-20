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
            @update:model-value="setFilter(selected[index], filter?.key)"
          >
            <div
              v-for="(option, i) in filter?.filterOptions"
              :key="i"
            >
              <v-btn
                :value="option.value"
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
      fteFilter: null

    };
  },
  computed: {
     
  },
  watch: {
     
  },
  created() {
    
  },
  methods: {
    setFilter(val, key) {
      console.log({key: key, val: val});
      switch(key) {
      case 'studentType':
        this.studentTypeFilter = {key: key, value: val};
        break;
      case 'fte':
        this.fteFilter = {key: key, value: val};
        break;
      case 'grade':
        this.gradeFilter = {key: key, value: val};
        break;
      case 'fundingType':
        this.fundingFilter = {key: key, value: val};
        break;
      case 'warnings':
        this.warningFilter = {key: key, value: val};
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
      this.studentTypeFilter= null;
      this.fteFilter= null;
    },
    close() {
      let filters = [];
      filters.push(this.studentTypeFilter);
      filters.push(this.fteFilter);
      filters.push(this.warningFilter);
      filters.push(this.fundingFilter);
      filters.push(this.gradeFilter);

      this.$emit('closeFilters', filters);
    },
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
    
    
  
