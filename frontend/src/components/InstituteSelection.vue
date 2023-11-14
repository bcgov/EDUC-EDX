<!--suppress ALL -->
<template>
  <v-container
    fluid
    class="full-height"
  >
    <v-row>
      <v-spacer />
      <v-col cols="6">
        <v-row>
          <v-col><h3>Which Dashboard would you like to access?</h3></v-col>
        </v-row>
        <v-row v-if="activeUserDistricts.length>0">
          <v-col class="mt-6 mb-3">
            <h2>District Dashboard</h2>
          </v-col>
        </v-row>
        <v-list
            v-if="activeUserDistricts.length>0"
            id="schools-district-items"
            style="padding-top: 0;padding-bottom: 0;"
            elevation="1"
            :border="true"
            :rounded="true"
            :loading="isTableLoading"
        >
          <div
              v-for="(item, index) in activeUserDistricts"
              :key="item.districtNumber"
          >
            <v-list-item
                :title="item.displayName"
                :subtitle="item.districtNumber"
                lines="two"
                @click="selectDistrict(item.districtID)"
            >
            </v-list-item>
            <v-divider v-if="index !== activeUserDistricts.length-1"></v-divider>
          </div>
        </v-list>
        <v-row v-if="activeUserSchools.length>0">
          <v-col class="mb-3">
            <h2>School Dashboard</h2>
          </v-col>
        </v-row>
        <v-list
            v-if="activeUserSchools.length>0"
            id="schools-dashboard-items"
            style="padding-top: 0;padding-bottom: 0;"
            elevation="1"
            :border="true"
            :rounded="true"
            :loading="isTableLoading"
        >
          <div
            v-for="(item, index) in activeUserSchools"
            :key="item.mincode"
          >
            <v-list-item
                :title="item.displayName"
                :subtitle="item.mincode"
                lines="two"
                @click="selectSchool(item.schoolID)"
            >
            </v-list-item>
            <v-divider v-if="index !== activeUserSchools.length-1"></v-divider>
          </div>
        </v-list>
      </v-col>
      <v-spacer />
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
    appStore().getInstitutesData().finally(() => {
      this.isTableLoading = false;
      const schoolsMap = this.activeSchoolsMap;
      this.activeUserSchools = this.userInfo?.userSchoolIDs?.map(function (value) {
        return {
          'mincode': schoolsMap.get(value)?.mincode,
          'schoolID': value,
          'displayName': schoolsMap.get(value)?.schoolName,
        };
      });
      this.activeUserSchools.sort((a,b) =>  {
        if (a.displayName > b.displayName) {
          return 1;
        } else if (a.displayName < b.displayName) {
          return -1;
        }
        return 0;
      });
      const districtMap = this.activeDistrictsMap;
      this.activeUserDistricts = this.userInfo?.userDistrictIDs?.map(function (value) {
        return {
          'districtNumber': districtMap.get(value)?.districtNumber,
          'districtID': value,
          'displayName': districtMap.get(value)?.name,
        };
      });
      this.activeUserDistricts.sort((a,b) =>  {
        if (a.displayName > b.displayName) {
          return 1;
        } else if (a.displayName < b.displayName) {
          return -1;
        }
        return 0;
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
.full-height{
  height: 50%;
}
</style>

