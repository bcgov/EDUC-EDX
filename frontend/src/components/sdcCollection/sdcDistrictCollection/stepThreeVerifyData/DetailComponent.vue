<template>
  <v-row>
    <v-col cols="12">
      <v-row justify="space-between">
        <v-col
          cols="4"
          class="found-align"
        >
          <span
            id="studentsFound"
            class="bold"
          >Students Found:  {{ totalElements }}
          </span>
          <router-link 
            class="ml-2"
            :to="{ path: downloadReportURL() }"
            target="_blank"
          >
            <v-icon
              small
              class="ml-1"
              color="#003366"
            >
              mdi-tray-arrow-down
            </v-icon>
            <span class="export">Export All Student Records</span>
          </router-link>
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end"
        >
          <v-btn
            id="bulkEdit"
            color="#003366"
            class="mr-1 mb-1"
            text="Bulk Edit"
            prepend-icon="mdi-pencil-outline"
            variant="outlined"
            :disabled="selectedStudents.length < 2"
          />
          <v-btn
            id="filters"
            color="#003366"
            text="Filter"
            class="mr-1 mb-1"
            prepend-icon="mdi-filter-multiple-outline"
            variant="outlined"
            @click="toggleFilters"
          >
            <template #append>
              <v-badge
                color="error"
                :content="filterCount"
                floating
                offset-y="-10"
              />
            </template>
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <CustomTable
            :headers="config.tableHeaders"
            :data="studentList"
            :total-elements="totalElements"
            :is-loading="isLoading"
            :reset="resetFlag"
            @reload="reload"
            @editSelectedRow="editStudent"
            @selections="selectedStudents = $event"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>   
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import CustomTable from '../../../common/CustomTable.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {cloneDeep, isEmpty, omitBy} from 'lodash';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';

export default {
  name: 'DetailComponent',
  components: {
    CustomTable
  },
  mixins: [alertMixin],
  props: {
    config: {
      tabFilter: Object,
      required: true,
      type: Object,
      default: null
    }
  },
  emits: [],
  data() {
    return {
      chip: true,
      pageNumber: 1,
      pageSize: 15,
      studentList: [],
      isLoading: false,
      totalElements: 0,
      selectedStudents: [],
      filterSearchParams: {
        tabFilter: this.config.defaultFilter,
        sdcSchoolCollectionStudentStatusCode: 'INFOWARN,FUNDWARN,VERIFIED',
        moreFilters: {}
      },
      showFilters: null,
      studentForEdit: [],
      editStudentSheet: false,
      resetFlag: false,
      filterCount: 0
    };
  },
  computed: {

  },
  created() {
    sdcCollectionStore().getCodes().then(() => {
      this.loadStudents();
    });

  },
  methods: {
    downloadReportURL() {
      return `${ApiRoutes.sdc.BASE_URL}/${this.$route.params.schoolCollectionID}/report/csv/download`;
    },
    editStudent($event) {
      const selectedStudent = cloneDeep($event);
      this.studentForEdit.splice(0);
      this.studentForEdit.push(selectedStudent?.sdcSchoolCollectionStudentID);
      this.editStudentSheet = true;
    },   
    loadStudents() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}/paginated?tableFormat=true`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            legalLastName: 'ASC'
          },
        }
      }).then(response => {
        this.studentList = response.data.content;
        this.totalElements = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    toggleFilters() {
      this.showFilters= !this.showFilters;
    },
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.loadStudents();
    },
  }
};
</script>

<style scoped>
.search-box {
  background: rgb(235, 237, 239);
  border-radius: 8px;
  padding: 10px;
}

.filter-col {
  color: #7f7f7f;
}

.bold {
  font-weight: bold ;
}

.found-align {
  align-self: flex-end;
}

.export {
  margin-left: 1px;
  color: #003366;
}
</style>