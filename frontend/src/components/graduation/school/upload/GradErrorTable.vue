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
              :cols="sub.cols"
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
        class="mt-2"
      >
        <td
          v-for="column in headers"
          :key="column.key"
          class="pt-2 row-text"
        >
          <span v-if="column.key === 'details' && column.hasOwnProperty('subHeader')">
            <span
              v-for="(error, index) in props.item['errorFilesetStudentValidationIssues']"
              :key="index"
            >
              <v-row style="margin-bottom: 0">
                <v-col
                  v-if="column.subHeader[0].key === 'fileType'"
                  cols="2"
                >{{ formatFileType(error?.errorFilesetValidationIssueTypeCode) }}&nbsp;<v-tooltip text="Tooltip">
                  <template #activator="{ props }">
                    <v-icon
                      class="mt-n1"
                      v-bind="props"
                      :color="getStatusColor(error?.validationIssueSeverityCode)"
                      :icon="getIssueIcon(error?.validationIssueSeverityCode)"
                    />
                  </template>
                  {{ error?.validationIssueSeverityCode === 'WARNING' ? 'Warning' : 'Error' }}
                </v-tooltip></v-col>
                <v-col v-if="column.subHeader[1].key === 'errorContext'">
                  <span v-if="error?.errorContext !== null">{{ error?.errorContext }}</span>
                  <span v-else>-</span>
                </v-col>
                <v-col v-if="column.subHeader[2].key === 'field'">{{ error?.validationIssueFieldCodeDescription }}</v-col>
                <v-col
                  v-if="column.subHeader[3].key === 'desc'"
                  cols="5"
                >
                  <div v-html="error?.validationIssueDescription" /> 
                </v-col>
              </v-row>
            </span>
          </span>
          <span v-else-if="props.item[column.key]">
            {{ props.item[column.key] }}
          </span>
          <span v-else-if="column.key === 'submissionLink'">
            <v-tooltip content-class="customTooltip">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  icon="mdi-page-next-outline"
                  color="primary"
                  variant="text"
                  v-bind="tooltipProps"
                  :to="getSubmissionRoute(props.item['pen'])"
                  :disabled="getSubmissionRouteDisabled(props.item)"
                  target="_blank"
                />
              </template>
              <span id="submissionLinkTooltip">View details of submission.</span>
            </v-tooltip>
          </span>
          <span v-else>-</span>
        </td>
      </tr>
    </template>
  </v-data-table-server>
</template>
      
<script>
import alertMixin from '../../../../mixins/alertMixin';
      
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
    submissionRoute: {
      type: Object,
      required: true
    }
  },
  emits: ['reload'],
  data() {
    return {
      errorList: [],
      pageNumber: 1,
      pageSize: 15
    };
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
    getSubmissionRoute(pen) {
      const toLink = structuredClone(this.submissionRoute);
      toLink.query.pen = ((pen instanceof String) || (typeof pen === 'string')) ? pen : '';
      return toLink;
    },
    formatFileType(text) {
      if(text === 'ASSESSMENT') {
        return 'XAM';
      } else if(text === 'COURSE') {
        return 'CRS';
      } else if(text === 'DEMOGRAPHICS') {
        return 'DEM';
      }
    },
    getIssueIcon(status) {
      if (status === 'WARNING') {
        return 'mdi-alert-outline';
      }
      else if (status === 'ERROR') {
        return 'mdi-alert-circle-outline';
      }
    },
    getStatusColor(status) {
      if (status === 'WARNING') {
        return '#ff9800';
      }
      else if (status === 'ERROR') {
        return '#d90606';
      }
    },
    getSubmissionRouteDisabled(item) {
      if (item && item['errorFilesetStudentValidationIssues']) {
        return item['errorFilesetStudentValidationIssues'].some(issue =>
          issue.validationIssueCode === 'DEM_DATA_MISSING'
        );
      }
      return false;
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

.status-chip {
  margin-top: 2px;
  margin-bottom: 2px;
}
      </style>
      
  
