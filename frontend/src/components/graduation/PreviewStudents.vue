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
          Preview of Summer Course Data
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
      <span>Below is a preview of your uploaded data from file: <b>{{fileName}}</b>. Please review the data before processing the data. See the Summary of Uploaded data table for status and error reporting.</span>

      <v-data-table
      :headers="headers"
      :items="data"
      v-model:page="pageNumber"
      v-model:items-per-page="pageSize"
    />

    <v-row>
      <v-col
        class="d-flex justify-end"
      >
        <v-btn
            id="waitForReporting"
            color="#003366"
            text="Wait until the next Reporting Cycle"
            class="mr-2 mb-1"
            variant="elevated"
            @click="cancel"
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
    data: {
      type: Array,
      required: true,
      default: null
    },
    fileName: {
      type: String,
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
  emits: ['reload', 'close'],
  data() {
    return {
      pageNumber: 1,
      pageSize: 25,
    };
  },
  computed: {
    
  },
  watch: {
  },
  async created() {
        
  },
  beforeUnmount() {
            
  },
  methods: {
    cancel() {
      this.$emit('close');
    },
    async processStudents() {
      let body = {
        fileName: this.fileName,
        summerStudents: this.data
      }
      await ApiService.apiAxios.post(ApiRoutes.gdc.BASE_URL + '/school/' + this.schoolID + '/process', body)
        .then(() => {
          this.$emit('close');
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


        </style>
        
    
  
