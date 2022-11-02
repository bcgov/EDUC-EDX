<template>
  <v-system-bar app absolute color="rgb(0, 51, 102)" height="56rem" class="sysBar"
                :class="{'pl-2': $vuetify.breakpoint.smAndDown, 'pl-10': $vuetify.breakpoint.mdAndUp, 'pr-2': $vuetify.breakpoint.smAndDown, 'pr-10': $vuetify.breakpoint.mdAndUp} ">
    <!-- Navbar content -->
    <a tabindex="-1" href="/">
      <img
          tabindex="-1"
          src="@/assets/images/bc-gov-logo.svg"
          width="155"
          class="logo"
          alt="B.C. Government Logo"
      >
    </a>
    <a tabindex="-1" href="/">
      <v-toolbar-title><h3 class="mainTitle" style="color:white">{{ appTitle }}</h3></v-toolbar-title>
    </a>


    <v-spacer></v-spacer>
    <div v-if="isAuthenticated && dataReady">
      <v-menu name="user_options" offset-y>
        <template v-slot:activator="{ on }">
          <v-chip tabindex="0" v-on="on" pill color="#003366" dark>
            <v-avatar left color="info">
              {{ userInfo.displayName[0] }}
            </v-avatar>
            <span class="display-name">{{ userInfo.displayName }}</span>
          </v-chip>
        </template>
        <v-list dark color="#003366">
          <v-list-item style="min-height: 4vh" id="home_button" :href='authRoutes.DASHBOARD'>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="hasSeveralSchools() || hasSeveralDistricts() || hasBothSchoolAndDistrict()" id="switch_dashboard_button" :href='authRoutes.INSTITUTE_SELECTION'>
            <v-list-item-title>Switch Dashboard</v-list-item-title>
          </v-list-item>
          <v-list-item style="min-height: 4vh" id="logout_button" :href='authRoutes.LOGOUT'>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

    </div>
    <div v-else-if="isAuthenticated && !dataReady">
      <v-skeleton-loader type="chip">
      </v-skeleton-loader>
    </div>
  </v-system-bar>
</template>

<script>
import {mapGetters} from 'vuex';
import {AuthRoutes , ApiRoutes} from '@/utils/constants';

export default {
  data() {
    return {
      appTitle: process.env.VUE_APP_TITLE,
      authRoutes: AuthRoutes,
      apiRoutes: ApiRoutes
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
    dataReady: function () {
      return this.userInfo;
    }
  },
  methods: {
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
  z-index: 8;
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
