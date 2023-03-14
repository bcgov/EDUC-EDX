<!--suppress ALL -->
<template>
  <v-container
    v-if="!authStore().isAuthenticated && !authStore().isLoading"
    fluid
  >
    <!-- login article -->
    <article name="login-banner">
      <v-row
        align="center"
        justify="center"
        style="margin-right: 0;margin-left: 0"
      >
        <Login />
      </v-row>
    </article>
  </v-container>

  <v-container
    v-else-if="authStore().isLoading"
    fluid
    class="full-height"
  >
    <article
      id="progress-display-container"
      class="top-banner full-height"
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-progress-circular
          :size="60"
          :width="7"
          color="primary"
          indeterminate
        />
      </v-row>
    </article>
  </v-container>

  <v-container
    v-else
    fluid
    class="d-flex justify-center"
  >
    <v-row>
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <DashboardTable
          v-if="authStore().isAuthenticated && !isLoadingExchange"
          id="schoolInboxCard"
          :title="PAGE_TITLES.EXCHANGE"
          colour="#CED6E2"
          :table-data="exchangeData"
        />
        <v-container
          v-else-if="isLoadingExchange"
          class="tile-size"
          fluid
        >
          <article class="top-banner full-height">
            <v-row>
              <v-col class="d-flex justify-center">
                <v-progress-circular
                  :size="70"
                  :width="7"
                  color="primary"
                  indeterminate
                />
              </v-col>
            </v-row>
          </article>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Login from './Login.vue';
import { authStore } from '../store/modules/auth';
import { mapState } from 'pinia';
import DashboardTable from '../components/DashboardTable.vue';
import {PAGE_TITLES} from '../utils/constants';
export default {
  name: 'Home',
  components: {
    Login,
    DashboardTable
  },
  data(){
    return {
      exchangeData: [],
      isLoadingExchange: true,
      PAGE_TITLES: PAGE_TITLES
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'isLoading']),
  },
  mounted()  {
    this.exchangeData.push({
      title: 'School Inbox',
      button: {route: '/inbox', text: 'View Inbox'},
    });

    setTimeout(() => this.isLoadingExchange = false, 1000);
  },
  methods: {
    authStore
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.top-banner{
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

