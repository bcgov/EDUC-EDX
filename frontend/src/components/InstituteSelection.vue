<!--suppress ALL -->
<template>
  <v-container fluid class="full-height">
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="6">
        <v-row>
          <v-col><h3>Which Dashboard would you like to access?</h3></v-col>
        </v-row>
        <v-row v-if="activeUserSchools.length>0">
          <v-col><h2>School Dashboard</h2></v-col>
        </v-row>
        <v-data-table v-if="activeUserSchools.length>0"
                      id="schools-dashboard-items"
          :items="activeUserSchools"
          class="elevation-1"
          hide-default-header
          :headers="schoolHeaders"
          mobile-breakpoint="0"
          sort-by="displayName"
          hide-default-footer
          :loading="isTableLoading"
        >
          <template v-slot:item.mincode="{ item }">
            <v-row @click="selectSchool(item.schoolID)" style="cursor: pointer;">
              <v-col cols="7" md="10">
                <h3 class="mt-1 mb-1" style="color: black;">{{item.displayName}}</h3>
                <h3 style="color: grey;">{{item.mincode}}</h3>
              </v-col>
            </v-row>
          </template>
        </v-data-table>
        <v-row v-if="activeUserDistricts.length>0">
          <v-col class="mt-6"><h2>District Dashboard</h2></v-col>
        </v-row>
        <v-data-table v-if="activeUserDistricts.length>0"
                      id="schools-district-items"
            :items="activeUserDistricts"
            class="elevation-1"
            hide-default-header
            :headers="districtHeaders"
            mobile-breakpoint="0"
            sort-by="displayName"
            hide-default-footer
            :loading="isTableLoading"
        >
          <template v-slot:item.districtNumber="{ item }">
            <v-row @click="selectDistrict(item.districtID)" style="cursor: pointer;">
              <v-col cols="7" md="10">
                <h3 class="mt-1 mb-1" style="color: black;">{{item.displayName}}</h3>
                <h3 style="color: grey;">{{item.districtNumber}}</h3>
              </v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>

  </v-container>
</template>

<script>

import { authStore } from '../store/modules/auth';
import { appStore } from '../store/modules/app';
import { mapState } from 'pinia';
import ApiService from '../common/apiService';
import {ApiRoutes} from '../utils/constants';

export default {
  name: 'InstituteSelection',
  components: {
  },
  data() {
    return {
      activeUserSchools: [],
      activeUserDistricts:[],
      isTableLoading: true,
      schoolHeaders: [
        {
          text: 'Mincode',
          align: 'start',
          sortable: false,
          value: 'mincode',
          width: '200px',
        }
      ],
      districtHeaders: [
        {
          text: 'District Number',
          align: 'start',
          sortable: false,
          value: 'districtNumber',
          width: '200px',
        }
      ],
    };
  },
  computed: {
    ...mapState(appStore, ['activeSchoolsMap','activeDistrictsMap']),
    ...mapState(authStore, ['userInfo']),
  },
  created() {
    this.isTableLoading = true;
    this.$store.dispatch('app/getInstitutesData').finally(() => {
      this.isTableLoading = false;
      const schoolsMap = this.activeSchoolsMap;
      this.activeUserSchools = this.userInfo?.userSchoolIDs?.map(function (value) {
        return {
          'mincode': schoolsMap.get(value)?.mincode,
          'schoolID': value,
          'displayName': schoolsMap.get(value)?.schoolName,
        };
      });
      const districtMap = this.activeDistrictsMap;
      this.activeUserDistricts = this.userInfo?.userDistrictIDs?.map(function (value) {
        return {
          'districtNumber': districtMap.get(value)?.districtNumber,
          'districtID': value,
          'displayName': districtMap.get(value)?.name,
        };
      });
    });
  },
  methods: {
    selectSchool(schoolID){
      const payload = {params: {schoolID: schoolID}};
      ApiService.apiAxios.post(ApiRoutes.edx.INSTITUTE_SELECTION_URL, payload)
        .then(()=> {
          this.$router.push({name: 'home'});
        });
    },
    selectDistrict(districtID){
      const payload = {params: {districtID: districtID}};
      ApiService.apiAxios.post(ApiRoutes.edx.INSTITUTE_SELECTION_URL, payload)
        .then(()=> {
          this.$router.push({name: 'home'});
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.top-banner{
  background-color: aliceblue;
  background-size: cover;
  align-items: center;
  display: flex;
}
.full-height{
  height: 50%;
}
</style>

