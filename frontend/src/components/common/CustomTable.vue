<template>
  <div>
    <v-data-table-server
      v-model:page.sync="pageNumber"
      v-model:items-per-page.sync="pageSize"
      v-model="selected"
      :items-length="totalElements"
      :items="data" 
      :headers="headers"
      class="mt-2"
      mobile-breakpoint="0"
    >
      <template #top>
        <v-progress-linear
          v-show="isLoading"
          indeterminate
          color="primary"
        />
      </template>
      <template #headers>  
        <tr class="header-row">
          <th
            v-for="column in headers"
            id="header"
            :key="column.key"
          >       
            <div v-if="column.title === 'select'">
              <span @click="toggle()">
                <v-checkbox 
                  :input-value="masterCheckbox"
                  :indeterminate="selected.length > 0 && !isAllSelected()"
                />
              </span>
            </div> 
            <div v-else>
              <div class="header-text">
                {{ column.title }}
              </div>
              <div
                v-if="column.hasOwnProperty('subHeader')"
                class="header-text"
              >
                {{ column.subHeader.title }}
              </div>
            </div>
          </th>
        </tr>
      </template>
      <template #item="props">
        <tr>
          <td
            v-for="column in headers"
            :key="column.key"
            class="td-data"
          >
            <v-checkbox
              v-if="column.title === 'select'"
              :model-value="isSelected(props.item.value) !== undefined"
              @click="onClick(props)"
            /> 
            <div v-else>
              <div v-if="column.key === 'legalName'">
                <span v-if="props.item.value['legalLastName']">{{ props.item.value['legalLastName'] }}</span>,
                <span v-if="props.item.value['legalFirstName']">{{ props.item.value['legalFirstName'] }}</span>
                <span v-if="props.item.value['legalMiddleNames']">({{ props.item.value['legalMiddleNames'] }})</span>
              </div>

              <div v-else-if="column.key === 'isAdult'">
                <span v-if="props.item.value['isAdult'] !== null || props.item.value['isAdult' !== undefined]">{{ props.item.value['isAdult'] ==="true" ? 'Yes' :'No' }}</span>
              </div>

              <div v-else-if="column.key === 'fte'">
                <span>{{ props.item.value['fte'] === 0 ? 0 : props.item.value['fte'] }}</span>
              </div>

              <span v-else-if="props.item.value[column.key]">{{ props.item.value[column.key] }}</span>
              <span v-else>-</span>

              <div v-if="column.hasOwnProperty('subHeader')">
                <div v-if="column.subHeader.key === 'usualName'">
                  <div v-if="props.item.value['usualLastName'] || props.item.value['usualFirstName'] || props.item.value['usualMiddleNames']">
                    <span v-if="props.item.value['usualLastName']">{{ props.item.value['usualLastName'] }}</span>,
                    <span v-if="props.item.value['usualFirstName']">{{ props.item.value['usualFirstName'] }}</span>
                    <span v-if="props.item.value['usualMiddleNames']">({{ props.item.value['usualMiddleNames'] }})</span>
                  </div>
                  <span v-else>-</span>
                </div>
                <div v-else-if="column.subHeader.key === 'isGraduated'">
                  <span v-if="props.item.value['isGraduated'] !== null || props.item.value['isGraduated'] !== undefined">{{ props.item.value['isGraduated'] === "true" ? 'Yes' :'No' }}</span>
                </div>
                <span v-else-if="props.item.value[column.subHeader.key]">{{ props.item.value[column.subHeader.key] }}</span>
                <span v-else>-</span>
              </div>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table-server>
  </div>
</template>
       
<script>
     
export default {
  name: 'CustomTable',
  components: {
        
  },
  mixins: [],
  props: {
    headers: {
      type: Array,
      required: true,
      default: null
    },
    data: {
      type: Array,
      required: true,
      default: null
    },
    totalElements: {
      type: Number,
      required: true,
      default: 0
    },
    isLoading: {
      type: Boolean,
      required: true,
      default: false
    },
    
  },
  emits: ['reload'],
  data() {
    return {
      selected: [],
      pageNumber: 1,
      pageSize: 50,
      masterCheckbox: false,
      loading: true
    };
  },
  computed: {
  },
  watch: {
    pageSize(val) {
      if(val) {
        this.$emit('reload', {pageSize: val});
      }
    },
    pageNumber(val) { 
      if(val) {
        this.$emit('reload', {pageNumber: val});
      }
    }
  },
  created() {
    
  },
  methods: {
    onClick(prop) {
      let selectedValue = prop.item.value;
      if(this.isSelected(selectedValue)) {
        this.selected.splice(this.selected.findIndex(value => value.sdcSchoolCollectionStudentID === selectedValue.sdcSchoolCollectionStudentID), 1);
      } else {
        this.selected.push(prop.item.value);
      }
      this.masterCheckbox = this.selected.length > 0 && this.isAllSelected();
    },
    isSelected(selectedValue) {
      return this.selected.find(value => value.sdcSchoolCollectionStudentID === selectedValue.sdcSchoolCollectionStudentID);
    },
    isAllSelected() {
      const numSelected = this.selected.length;
      const totalRows = this.data.length;
      return numSelected === totalRows;
    },
    toggle() {
      if(this.selected.length !== 0 || this.isAllSelected()) {
        this.selected = [];
      } else {
        this.selected = [...this.data];
      }
      this.masterCheckbox = this.selected.length > 0 && this.isAllSelected();
    },
      
  }
};
</script>

<style scoped>
  .header-text {
    color: #7f7f7f;
 }

 .header-row {
    border-bottom-style: groove;
    border-bottom-color: rgb(255 255 255 / 45%);
    vertical-align: top !important;
 }
   
</style>
         
         
       
     
  
