<!--suppress ALL -->
<template>
  <v-container fluid class="full-height">
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="6">
        <v-row>
          <v-col><H3>Which Dashboard would you like to access ? </H3></v-col>
        </v-row>
        <v-data-table
          :items="activeMincodes"
          class="elevation-1"
          hide-default-header
          :headers="headers"
          mobile-breakpoint="0"
          hide-default-footer
          :loading="isTableLoading"
        >
          <template v-slot:item.mincode="{ item }">
            <v-row @click="selectInstitution(item.mincode)" style="cursor: pointer;">
              <v-col cols="7" md="10">
                <v-row>
                  <v-col cols="7" md="10">
                    <h3 class="subjectHeading" :style="{color: 'School Name' ? 'black': '#1f7cef'}">{{getSchoolName(item.mincode)}}</h3>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="7" md="10">
                    <h3 class="subjectHeading" :style="{color: 'School Name' ? 'grey': '#1f7cef'}">{{item.mincode}}</h3>
                  </v-col>
                </v-row>
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

import {mapState} from 'vuex';
import ApiService from '../common/apiService';
import {ApiRoutes} from '@/utils/constants';

export default {
  name: 'InstituteSelection',
  components: {
  },
  data() {
    return {
      isTableLoading: true,
      headers: [
        {
          text: 'Mincode',
          align: 'start',
          sortable: false,
          value: 'mincode',
          width: '200px',
        }
      ],
    };
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('auth', ['userInfo']),
    ...mapState('edx', ['ministryTeams']),
    activeMincodes(){
      if(this.userInfo?.userMinCodes){
        var json = this.userInfo.userMinCodes.map(function (value) {
          return {
            'mincode': value
          };
        });
        return json;
      }
      return [];
    }
  },
  created() {
    ApiService.apiAxios.get(ApiRoutes.edx.CLEAR_ACTIVE_USER_SESSION).then(() => {this.users = this.filteredUsers;});
    this.$store.dispatch('edx/getExchangeMincodes');
    this.$store.dispatch('edx/getMinistryTeams');
    this.$store.dispatch('auth/getUserInfo');
  },
  methods: {
    selectInstitution(mincode){
      const payload = {params: {mincode: mincode}};
      ApiService.apiAxios.post(ApiRoutes.edx.INSTITUTE_SELECTION_URL, payload)
        .then(()=> {
          this.$router.push({name: 'home'});
        });
    },
    loadMincodeSchools(){
      if(this.mincodeSchoolNames.size === 0){
        this.$store.dispatch('app/getMincodeSchoolNames').finally(() => {
          this.isTableLoading = false;
        });
      }else{
        this.isTableLoading = false;
      }
    },
    getSchoolName(mincode) {
      this.loadMincodeSchools();
      return this.mincodeSchoolNames.get(mincode);
    },
    setFilterStatusActive() {
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN'];
    },
    statusFilterActiveClicked() {
      this.setFilterStatusActive();
      this.resetPageNumber();
    },
    resetPageNumber(){
      this.pageNumber = 1;
    },
    clearSearch(runSearch = true){
      this.subjectFilter = '';
      this.messageDate = null;
      this.messageDateFilter = null;
      this.statusSelectFilter = '';
      this.contactNameFilter = '';
      this.messageIDFilter ='';
      if(runSearch){
        this.setFilterStatusAll();
      }
    },
    getStatusColor(status) {
      if (status === 'Open') {
        return 'green';
      } else if (status === 'Closed') {
        return 'black';
      }
    },
    getContentString(content, length) {
      if (content.length > length) {
        return content.substring(0, length) + '...';
      }
      return content;
    },
    filterRequests(){
      this.setFilterStatusAll();
      this.resetPageNumber();
    },
  },
  watch: {
    pageSize() {
      this.getRequests();
    },
    pageNumber() {
      this.getRequests();
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

