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

  <v-container fluid v-else class="full-height">
<v-row class="pb-6">
  <v-col cols="8" >
    <DashboardTable  v-if="isAuthenticated && !isLoadingExchange" title="Secure Messaging" colour="#CED6E2"
                     :tableData="exchangeData"></DashboardTable>
    <v-container v-else-if="isLoadingExchange" class="full-height" fluid>
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
  .full-height{
    height: 100%;
  }
</style>

