<template>
  <v-container
    fluid
    class="full-height"
  >
    <article id="login-banner">
      <v-row
        align="center"
        justify="center"
      >
        <v-card
          variant="elevated"
          elevation="8"
          class="login-card"
        >
          <v-card-title class="gov-header">
            <h4 id="login_text">
              Log In
            </h4>
          </v-card-title>
          <v-card-text id="login_descriptor">
            Welcome to the Education Data Exchange!
          </v-card-text>
          <v-row
            no-gutters
            class="my-1"
            align="center"
            justify="center"
          >
            <v-col class="d-flex justify-center">
              <v-btn
                id="login-button-microsoft"
                variant="outlined"
                :href="authRoutes.LOGIN_ENTRA"
                class="ma-2"
                @click="clearStorage"
              >
                <img
                  tabindex="-1"
                  src="../assets/images/microsoftlogo.png"
                  width="55"
                  class="logo mx-n5"
                  alt="B.C. Government Logo"
                >Log In with Microsoft
              </v-btn>
            </v-col>
          </v-row>
          <v-row
            no-gutters
            class="my-1"
            align="center"
            justify="center"
          >
            <v-col class="d-flex justify-center">
              <v-btn
                id="login-button-bceid"
                variant="outlined"
                :href="authRoutes.LOGIN_BCEID"
                class="ma-2"
                @click="clearStorage"
              >
                <img
                  tabindex="-1"
                  src="../assets/images/bcid-mstile-70x70.png"
                  width="50"
                  class="logo mx-n3"
                  alt="B.C. Government Logo"
                >Log In with Basic BCeID
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-row>
      <v-row no-gutters>
        <v-col class="pt-6 d-flex justify-center need-help">
          <div>
            Need
            <a
              class="touLink"
              target="_blank"
              :href="config.TERMS_OF_USE_URL"
              @click.stop
            >
              help
            </a>
            logging in?
          </div>
        </v-col>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import { authStore } from '../store/modules/auth';
import { mapState } from 'pinia';
import { AuthRoutes } from '../utils/constants';
import {appStore} from '../store/modules/app';

export default {
  name: 'Login',
  components: {

  },
  data() {
    return {
      appTitle: 'Education Data Exchange',
      authRoutes: AuthRoutes
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated']),
    ...mapState(appStore, ['config'])
  },
  methods: {
    clearStorage() {
      authStore().setJwtToken();
    }
  }
};
</script>

<style scoped>
  .full-height{
    height: 100%;
  }

  .login-card{
    margin-top: 15rem;
    background-color: #003366;
    color: white;
  }

  .need-help{
    margin-left: 10em;
  }

  .touLink{
    color: #1976d2 !important;
  }
</style>
