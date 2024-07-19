<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <div
    v-else
    class="border"
  >
    <v-data-iterator
      v-model:page.sync="pageNumber"
      :items="studentDifferences"
      :items-per-page="10"
    >
      <template #default="{ items }">
        <v-row
          v-for="difference in items"
          :key="difference?.raw"
          class="pt-4"
          no-gutters
        >
          <v-col class="pa-0">
            <v-row no-gutters>
              <v-col class="pb-2">
                <v-chip color="primary">
                  <v-col><b>Assigned PEN:</b> {{ difference?.raw?.currentStudent?.assignedPen }}</v-col>
                  <v-col><b>School:</b> {{ difference?.raw?.currentStudent?.schoolName }}</v-col>
                </v-chip>
              </v-col>
            </v-row>

            <CustomTable
              :headers="headers"
              :data="[difference?.raw?.originalStudent, difference?.raw?.currentStudent]"
              :is-loading="false"
              :reset="false"
              :show-diff="true"
              :total-elements="2"
              :hide-pagination="true"
            >
            </CustomTable>
          </v-col>
        </v-row>
      </template>
    </v-data-iterator>
    <v-pagination
      v-if="studentDifferences?.length > 0"
      v-model="pageNumber"
      :length="Math.ceil(studentDifferences?.length/10)"
      total-visible="5"
      rounded="circle"
    />
  </div>
</template>
<script>
import {defineComponent} from 'vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {
  DISTRICT_STUDENT_DIFFERENCES
} from '../../../../utils/sdc/DistrictCollectionTableConfiguration';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';
import Spinner from '../../../common/Spinner.vue';
import alertMixin from '../../../../mixins/alertMixin';
import CustomTable from '../../../common/CustomTable.vue';

export default defineComponent({
  name: 'StudentDifferencesComponent',
  components: {
    CustomTable,
    Spinner,
  },
  mixins: [alertMixin],
  emits: ['next'],
  data() {
    return {
      isLoading: true,
      studentDifferences: null,
      pageNumber: 1,
      headers: DISTRICT_STUDENT_DIFFERENCES.tableHeaders,
      sdcDistrictCollectionID: this.$route.params.sdcDistrictCollectionID,
      sdcSchoolCollectionID: this.$route.params.sdcSchoolCollectionID,
    };
  },
  async created() {
    sdcCollectionStore().getCodes().then(() => {
      this.getStudentDifferences();
    });
  },
  methods: {
    getStudentDifferences(){
      this.isLoading = true;
      ApiService.apiAxios.get(ApiRoutes.sdc.SDC_DISTRICT_COLLECTION + '/'+ this.sdcDistrictCollectionID + '/studentDifferences').then(response => {
        this.studentDifferences = response.data;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error.response?.data?.message || error.message);
        this.apiError = true;
      }).finally(() => {
        this.isLoading = false;
      });
    },

  }
});
</script>

<style scoped>
.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}
.form-hint{
  color: rgb(56, 89, 138);
  font-size: 14px;
}
</style>
