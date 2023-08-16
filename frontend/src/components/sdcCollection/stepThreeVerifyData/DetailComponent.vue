<template>
  <v-row>
    <v-col cols="12">
      <v-row
        id="search-box"
        class="search-box mt-2"
      >
        <v-col cols="12">
          <v-row>
            <v-col
              class="d-flex justify-start"
              cols="4"
            >
              <v-text-field
                v-model="searchText"
                label="PEN, Local ID, Name"
                color="primary"
                variant="underlined"
              />
            </v-col>
            <v-col
              class="filter-col"
              cols="4"
            >
              <p v-if="config.defaultFilter === ''">
                No filters applied
              </p>
              <div v-else>
                <v-chip
                  v-if="chip"
                  color="#003366"
                  closable
                  @click:close=" chip = false"
                >
                  {{ config.defaultFilter }}
                </v-chip> 
              </div>
            </v-col>
            <v-col
              class="d-flex justify-end"
              cols="4"
            >
              <PrimaryButton
                id="filters"
                secondary
                large-icon
                icon="mdi-filter-multiple-outline"
                text="More Filters"
                class="mt-n1"
              />
            </v-col>
          </v-row>
          <v-row class="mt-n2">
            <v-col>
              <PrimaryButton
                id="clear"
                secondary
                text="Clear"
                :click-action="clear"
              />

              <PrimaryButton
                id="search"       
                text="Search"
                class="ml-3"
                :click-action="search"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-row />
      </v-row>

      <v-row justify="space-between">
        <v-col cols="4">
          <span class="bold">Students Found:  {{ totalElements }} </span>
          <v-icon
            small
            class="ml-1"
            color="#003366"
          >
            mdi-tray-arrow-down
          </v-icon>
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end"
        >
          <PrimaryButton
            id="add"
            secondary
            text="Add Student"
            class="mr-1 mb-1"
            large-icon
            icon="mdi-plus"
          />

          <PrimaryButton
            id="remove"
            secondary
            text="Remove"
            class="mr-1 mb-1"
            large-icon
            icon="mdi-trash-can-outline"
          />

          <PrimaryButton
            id="edit"
            secondary
            text="Bulk Edit"
            class="mr-1 mb-1"
            large-icon
            icon="mdi-pencil-outline"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <CustomTable
            :headers="config.tableHeaders"
            :data="studentList"
            :total-elements="totalElements"
            :is-loading="isLoading"
            @reload="reload"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import CustomTable from '../../common/CustomTable.vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {isEmpty, omitBy } from 'lodash';

export default {
  name: 'DetailComponent',
  components: {
    PrimaryButton,
    CustomTable
  },
  mixins: [alertMixin],
  props: {
    config: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: [],
  data() {
    return {
      chip: true,
      pageNumber: 1,
      pageSize: 50,
      studentList: [],
      isLoading: false,
      totalElements: 0,
      searchText: '',
      headerSearchParams: {
        type: this.config.defaultFilter,
        // sdcSchoolCollectionStudentStatusCode: 'LOADED, ERROR, WARNING, VERIFIED, FIXABLE'
      },
    };
  },
  mounted() {
    this.loadStudents();
  },
  created() {
  },
  methods: {
    loadStudents() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/paginated`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.headerSearchParams, isEmpty),
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
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.loadStudents();
    },

    search() {
    },

    clear() {
      this.searchText = '';
    }
    
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
    text-align: center;
}

.bold {
  font-weight: bold ;
}

 
       </style>
       
       
     
   
