<template>
  <v-card
    id="previewCard"
  >
    <v-card-title
      id="previewCardTitle"
      class="sheetHeader pt-1 pb-1"
    >
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Preview of Summer Course Data - {{ fileName }}
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="cancel"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <span>Below is a preview of your uploaded data from file: <b>{{ fileName }}</b>. Please review the data before processing the data. See the Summary of Uploaded data table for status and error reporting.</span>

      <v-data-table
        v-model:page="pageNumber"
        v-model:items-per-page="pageSize"
        :headers="headers"
        :items="data"
        class="mt-3"
      />

      <v-row>
        <v-col
          class="d-flex justify-end mr-3 mt-3"
        >
          <v-btn
            id="waitForReporting"
            color="#003366"
            text="Wait until the next Reporting Cycle"
            class="mr-2 mb-1"
            variant="elevated"
            @click="waitForReporting"
          />
          <v-btn
            id="processData"
            color="#003366"
            text="Process Data"
            class="mr-2 mb-1"
            variant="outlined"
            @click="processStudents"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
        
<script>
import alertMixin from '../../mixins/alertMixin';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
        
export default {
  name: 'PreviewStudents',
  components: {
  },
  mixins: [alertMixin],
  props: {
    headers: {
      type: Array,
      required: true,
      default: null
    },
    summerStudents: {
      type: Array,
      required: true,
      default: null
    },
    schoolID: {
      type: String,
      required: false,
      default: null
    },
    districtID: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: ['reload', 'close', 'process'],
  data() {
    return {
      pageNumber: 1,
      pageSize: 25,
      data:[],
      fileName: null,
      page: 1,
      removeIndex: null,
    };
  },
  computed: {
    
  },
  watch: {
    summerStudents: {
      handler(value) {
        if(value.length > 0) {
          this.fileName = value[0].fileName;
          this.data = value[0].data;
        }
      },
      immediate: true
    }
  },
  async created() {
        
  },
  beforeUnmount() {
            
  },
  methods: {
    waitForReporting() {
      this.removeIndex = this.summerStudents.findIndex(value => value.fileName === this.fileName);
      this.summerStudents.splice(this.removeIndex, 1);
      this.$emit('close');
    },
    cancel() {
      this.$emit('close');
    },
    async processStudents() {
      let body = {
        fileName: this.fileName,
        summerStudents: this.data
      };
      let url = this.schoolID ? ApiRoutes.gdc.BASE_URL + '/school/' + this.schoolID: ApiRoutes.gdc.BASE_URL + '/district/' + this.districtID;
      await ApiService.apiAxios.post(url + '/process', body)
        .then(() => {
          this.$emit('process');
        }).catch(error => {
          console.error(error);
          this.setFailureAlert('An error occurred while trying to process students. Please try again later.');
        });
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

 :deep(.v-data-table-header__content) {
  color: #7f7f7fed !important;
}


        </style>
        
    
  
