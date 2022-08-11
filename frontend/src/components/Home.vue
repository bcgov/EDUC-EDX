<!--suppress ALL -->
<template>
  <v-container fluid class="full-height" v-if="!isAuthenticated && !isLoading">
    <!-- login article -->
    <article name="login-banner">
      <v-row align="center" justify="center" style="margin-right: 0;margin-left: 0">
        <Login></Login>
      </v-row>
    </article>
  </v-container>

  <v-container fluid class="full-height" v-else-if="isLoading">
    <article id="progress-display-container" class="top-banner full-height">
      <v-row align="center" justify="center">
        <v-progress-circular
            :size="60"
            :width="7"
            color="primary"
            indeterminate
        ></v-progress-circular>
      </v-row>
    </article>
  </v-container>

  <v-container fluid v-else class="card-size margin-initial">
    <v-row class="pb-6 tile-size">
      <v-col cols="2" md="5" class="tile-size">
        <DashboardTable  v-if="isAuthenticated && !isLoadingExchange" :title="PAGE_TITLES.EXCHANGE" colour="#CED6E2"
                         :tableData="exchangeData" id="schoolInboxCard"></DashboardTable>
        <v-container v-else-if="isLoadingExchange" class="tile-size" fluid>
          <article class="top-banner full-height">
            <v-row align="center" justify="center">
              <v-progress-circular
                  :size="70"
                  :width="7"
                  color="primary"
                  indeterminate
              ></v-progress-circular>
            </v-row>
          </article>
        </v-container>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import Login from './Login';
import { mapGetters } from 'vuex';
import DashboardTable from '@/components/DashboardTable';
import {PAGE_TITLES} from '@/utils/constants';
export default {
  name: 'home',
  components: {
    Login,
    DashboardTable
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'isLoading']),
  },
  data(){
    return {
      exchangeData: [],
      isLoadingExchange: true,
      PAGE_TITLES: PAGE_TITLES
    };
  },
  mounted()  {
    //TODO: replace this with API call and add ROLES for secure exchange messaging
    //if (this.EXCHANGE_ROLE) {
    this.exchangeData.push({
      title: 'School Inbox',
      button: {route: '/inbox', text: 'View Inbox'},
    });

    setTimeout(() => this.isLoadingExchange = false, 1000);
    //}
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
.tile-size{
  height: 100%;
  width: 100%;
}
.card-size{
  height: 12em;
  width: 62em;
}
.margin-initial {
  margin: initial;
}
</style>

