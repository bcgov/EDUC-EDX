<template>
  <v-app-bar
    absolute
    color="rgb(0, 51, 102)"
    class="sysBar"
    style="z-index: 1002;"
    :class="{'pl-2': $vuetify.display.smAndDown, 'pl-10': $vuetify.display.mdAndUp, 'pr-2': $vuetify.display.smAndDown, 'pr-10': $vuetify.display.mdAndUp} "
  >
    <!-- Navbar content -->
    <a
      tabindex="-1"
      href="/"
    >
      <img
        tabindex="-1"
        src="../assets/images/bc-gov-logo.svg"
        width="155"
        class="logo"
        alt="B.C. Government Logo"
      >
    </a>
    <a
      tabindex="-1"
      href="/"
    >
      <v-toolbar-title><h3
        class="mainTitle"
        style="color:white"
      >{{ appTitle }}</h3></v-toolbar-title>
    </a>

    <v-spacer />
    <div v-if="authStore().isAuthenticated && dataReady">
      <v-menu
        name="user_options"
        offset-y
      >
        <template #activator="{ props }">
          <v-chip
            v-bind="props"
            tabindex="0"
            pill
            color="#003366"
            dark
          >
            <v-avatar
              left
              color="info"
            >
              {{ getName()[0] }}
            </v-avatar>
            <span class="display-name pl-1">{{ getName() }}</span>
          </v-chip>
        </template>
        <v-list
          dark
          style="background-color: #003366; color: white"
        >
          <v-list-item
            id="home_button"
            style="min-height: 4vh"
            :href="authRoutes.DASHBOARD"
          >
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="hasSeveralSchools() || hasSeveralDistricts() || hasBothSchoolAndDistrict()"
            id="switch_dashboard_button"
            :href="authRoutes.INSTITUTE_SELECTION"
          >
            <v-list-item-title>Switch Dashboard</v-list-item-title>
          </v-list-item>
          <v-list-item
            id="logout_button"
            style="min-height: 4vh"
            :href="authRoutes.LOGOUT"
          >
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script>
import { authStore } from '../store/modules/auth';
import { mapState } from 'pinia';
import {AuthRoutes , ApiRoutes} from '../utils/constants';

export default {
  data() {
    return {
      appTitle: 'Education Data Exchange',
      authRoutes: AuthRoutes,
      apiRoutes: ApiRoutes
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    dataReady: function () {
      return this.userInfo;
    }
  },
  methods: {
    getName(){
      return this.userInfo?.displayName;
    },
    authStore,
    hasSeveralSchools() {
      return this.userInfo?.userSchoolIDs?.length > 1;
    },
    hasSeveralDistricts() {
      return this.userInfo?.userDistrictIDs?.length > 1;
    },
    hasBothSchoolAndDistrict(){
      return this.userInfo?.userDistrictIDs?.length>0 && this.userInfo?.userSchoolIDs?.length > 0;
    }
  }
};
</script>
<style>
.gov-header .v-icon{
  padding-left: 10px;
}

.mainTitle {
  font-size: 1.2rem;
}

.display-name{
  color: white;
}

a {
  text-decoration: none;
}
.logo{
  padding-right: 15px;
}
.gov-header .title {
  color: #fff;
  text-decoration: none;
}
.sysBar {
  border-bottom: 2px solid rgb(252, 186, 25) !important;
}
.gov-header .v-btn,
.v-btn--active.title:before,
.v-btn.title:focus:before,
.v-btn.title:hover:before {
  color: #fff;
  background: none;
}

.v-input__slot{
  padding-top: 10px
}
.top-down{
  padding-top: 20px;
  height: 80%;
}

@media screen and (max-width: 801px){
  .logo {
    width: 100px;
  }

  .mainTitle {
    font-size: 1.0rem;
  }

  .display-name{
    display: none;
  }
}
</style>
