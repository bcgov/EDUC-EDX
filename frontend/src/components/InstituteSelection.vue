<!--suppress ALL -->
<template>
  <v-container fluid class="full-height">
    <v-row>
      <v-col>
        <v-data-table
              :items="activeMincodes"
              class="elevation-1"
              hide-default-header
              mobile-breakpoint="0"
          >
          <template v-slot:item="{ item }">
            <v-row style="cursor: pointer;">
              <v-col cols="7" md="10" class="pb-0 pt-0">
                <v-row class="mb-n4">
                  <v-col cols="12" class="pb-2 pt-2 pr-0">
                    <h3 class="subjectHeading" :style="{color: 'School Name' ? 'black': '#1f7cef'}">{{getSchoolName(item) + item}}</h3>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>

import {mapState} from 'vuex';
export default {
  name: 'InstituteSelection',
  components: {
  },
  data() {
    return {

    };
  },
  computed: {
    ...mapState('auth', ['userInfo']),
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('edx', ['ministryTeams']),
    activeMincodes(){
      return this.userInfo?.userMinCodes || [];
    },
    getMincodeSchoolNames(){
      return this.mincodeSchoolNames || [];
    }
  },
  created() {
    this.$store.dispatch('edx/getExchangeMincodes');
    this.$store.dispatch('edx/getMinistryTeams');
    this.$store.dispatch('app/getMincodeSchoolNames');
    this.$store.dispatch('auth/getUserInfo');
    console.log('Created');

  },
  methods: {
    getSchoolName(mincode) {
      return this.getMincodeSchoolNames().get(mincode);
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
    height: 100%;
  }
</style>

