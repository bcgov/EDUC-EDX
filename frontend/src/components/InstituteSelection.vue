<!--suppress ALL -->
<template>
  <v-container fluid class="full-height">
    <v-row>
      <v-col>
        <v-data-table
              :items-per-page.sync="pageSize"
              :page.sync="pageNumber"
              :headers="headers"
              :items="activeMincodes"
              :loading="isTableLoading"
              class="elevation-1"
              hide-default-header
              mobile-breakpoint="0"

          >
          <template v-slot:item="{ item }">
            <v-row style="cursor: pointer;">
              <v-col cols="7" md="10" class="pb-0 pt-0">
                <v-row class="mb-n4">
                  <v-col cols="12" class="pb-2 pt-2 pr-0">
                    <h3 class="subjectHeading" :style="{color: 'School Name' ? 'black': '#1f7cef'}">{{getSchoolName(item)}}</h3>
                  </v-col>
                </v-row>
                <v-row class="mb-n4">
                  <v-col cols="12" class="pb-1 pr-0">
                    <h3 class="ministryLine" :style="{color: 'School Name' ? 'grey': '#1f7cef'}">{{item}}</h3>
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
      isTableLoading: true
    };
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('auth', ['userInfo']),
    ...mapState('edx', ['ministryTeams']),
    activeMincodes(){
      return this.userInfo?.userMinCodes || [];
    }
  },
  created() {
    this.$store.dispatch('edx/getExchangeMincodes');
    this.$store.dispatch('edx/getMinistryTeams');
    this.$store.dispatch('auth/getUserInfo');
  },
  methods: {
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
.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.tableRow {
  cursor: pointer;
}

.unread {
  font-weight: bold;
}

.v-data-table >>> .v-data-table__wrapper {
  overflow-x: hidden;
}

.filterButton.v-btn--outlined {
  border: thin solid #ebedef;
}

.v-radio >>> .v-icon {
  color: #003366;
}

.activeRadio {
  color: #003366;
}

.subjectHeading {
  font-size: x-large;
  cursor: pointer;
}

.ministryLine {
  color: black;
  font-size: large;
}

.statusCodeLabel {
  font-size: large;
}

.v-dialog__content >>> .v-bottom-sheet {
  width: 30% !important;
}

.v-expansion-panel-header:not(.v-expansion-panel-header--mousedown):focus::before {
  display: none;
}

  @media screen and (max-width: 801px){
    .subjectHeading {
      font-size: medium;
    }

    .statusCodeLabel{
      font-size: inherit;
    }

    .ministryLine{
      font-size: inherit;
    }
  }
  @media screen and (max-width: 950px){
    .v-dialog__content /deep/ .v-bottom-sheet {
      width: 60% !important;
    }
  }

</style>

