<template>
  <v-toolbar class="toolbar_header" dense width="100%">
    <!-- Navbar content -->
      <img
              src="@/assets/images/bc-gov-logo.svg"
              class="img-theme"
              alt="B.C. Government Logo"
      >
    <v-toolbar-title><span class="span-title">{{ appTitle }}</span></v-toolbar-title>

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
          <v-list-item style="min-height: 4vh" id="home_button" :href='authRoutes.LOGIN'>
            <v-list-item-title>Home</v-list-item-title>
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
  </v-toolbar>
</template>

<script>
import {mapGetters} from 'vuex';
import {AuthRoutes} from '@/utils/constants';

export default {
  data() {
    return {
      appTitle: process.env.VUE_APP_TITLE,
      authRoutes: AuthRoutes
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    ...mapGetters('auth', ['userInfo']),
    dataReady: function () {
      return this.userInfo;
    }
  },
};
</script>

<style>
  .v-icon {
    padding-left: 10px;
  }

  a {
    text-decoration: none;
  }

  .v-toolbar__content {
    padding: 4px 10px 4px 65px;
  }

  .title {
    width: 50%;
    height: auto;
    max-height: 50px !important;
  }
  .span-title{
    color: white;
    text-align: center !important;
  }
  @media screen and (min-width: 601px) {
    .span-title {
      font-size: 20px;
    }
    .img-theme {
      width: 20%;
      max-height: 40px !important;
    }
    .display-name{
      display: inline-block;
    }
  }

  @media screen and (min-width: 301px) and (max-width: 600px) {
    .span-title {
      padding-left: 2px !important;
      font-size: 12px;
    }
    .img-theme {
      align-content: center;
      width: 35%;
      max-height: 100px !important;
      padding-right: inherit;
    }
    .display-name{
      display: none;
    }
  }

  @media screen and (max-width: 300px) {
    .span-title {
      padding-left: 2px !important;
      font-size: 15px;
    }
    .img-theme {
      width: 15%;
      max-height: 100px !important;
      padding-right: inherit;
    }
    .display-name{
      display: none;
    }
  }
  .toolbar_header {
    background-color: rgb(0, 51, 102) !important;
    border-bottom: 2px solid rgb(252, 186, 25) !important;
    max-height: 3.5rem;
  }

  .gov-header .v-btn,
  .v-btn--active.title:before,
  .v-btn.title:focus:before,
  .v-btn.title:hover:before {
    color: #fff;
    background: none;
  }

  .secondary_color {
    background-color: var(--v-secondary-base);
  }

  .v-input__slot {
    padding-top: 10px
  }

  .top-down {
    padding-top: 20px;
    height: 80%;
  }

  .v-alert {
    margin-bottom: 0;
  }

</style>
