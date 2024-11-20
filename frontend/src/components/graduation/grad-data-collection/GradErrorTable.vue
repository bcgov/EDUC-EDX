<template>
  <v-data-table-server
    v-model:page.sync="pageNumber"
    v-model:items-per-page.sync="pageSize"
    :items-length="totalElements"
    :items="data"
    :headers="headers"
    mobile-breakpoint="0"
  >
    <template #top>
      <v-progress-linear
        v-show="isLoading"
        :indeterminate="true"
        color="primary"
      />
    </template>
    <template #headers>
      <tr>
        <th
          v-for="column in headers"
          id="header"
          :key="column.key"
        >
          <v-row
            v-if="column.key==='details' && column.hasOwnProperty('subHeader')"
            class="header-text"
          >
            <v-col
              v-for="(sub, index) in column.subHeader"
              :key="index"
              cols="3"
            >
              {{ sub.title }}
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col class="header-text mr-12">
              {{ column.title }}
            </v-col>
          </v-row>
        </th>
      </tr>
    </template>
    <template #item="props">
      <tr
        @click="rowclicked(props.item)"
      >
        <td
          v-for="column in headers"
          :key="column.key"
          class="row-text"
        >
          <span v-if="column.key === 'details' && column.hasOwnProperty('subHeader')">
            <span v-for="(error, index) in props.item['errorFilesetStudentValidationIssues']" :key="index">
              <v-row>
                <v-col
                  v-if="column.subHeader[0].key === 'fileType'"
                  cols="3"
                > {{ formatText(error?.errorFilesetValidationIssueTypeCode) }}</v-col>
                <v-col
                  v-if="column.subHeader[1].key === 'errors'"
                  cols="3"
                >{{ formatText(error?.validationIssueSeverityCode) }}</v-col>
                <v-col v-if="column.subHeader[2].key === 'desc'">{{ error?.validationIssueCodeDesc }}</v-col> 
              </v-row>
            </span>
          </span>
          <span v-else-if="props.item[column.key]">
            {{ props.item[column.key] }}
          </span>
          <span v-else>-</span>
        </td>
      </tr>
    </template>
  </v-data-table-server>
</template>
      
<script>
import alertMixin from '../../../mixins/alertMixin';
import {capitalize} from 'lodash';
      
export default {
  name: 'GradErrorTable',
  components: {
  },
  mixins: [alertMixin],
  props: {
    totalElements: {
      type: Number,
      required: true,
      default: 0
    },
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
    isLoading: {
      type: Boolean,
      required: true,
      default: false
    },
  },
  emits: ['reload'],
  data() {
    return {
      errorList: [],
      pageNumber: 1,
      pageSize: 15,
    };
  },
  computed: {
  
  },
  watch: {
    pageNumber: {
      handler(val) {
        if(val) {
          this.$emit('reload', {pageNumber: val});
        }
      },
      immediate: true
    },
  },
  async created() {
      
  },
  beforeUnmount() {
          
  },
  methods: {
    rowclicked() {

    },
    formatText(text) {
      return capitalize(text);
    }
     
  }
};
</script>
      
      <style scoped>
    .header-text {
  color: #7f7f7f;
}

:deep(.v-table__wrapper){
         overflow: unset;
       }

       :deep(.v-data-table-footer__items-per-page) {
       display: none;
 }

 .row-text {
  vertical-align: text-top;
 }
      </style>
      
  
