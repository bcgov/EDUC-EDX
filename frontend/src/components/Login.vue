<template>
  <v-container>
    <article id="login-banner" class="top-banner">
      <v-row align="center" justify="center">
        <v-card class="login-card">
          <v-card-title class="gov-header">
            <h4 id="login_text">Log In</h4>
          </v-card-title>
          <v-card-text id="login_descriptor">
            Welcome to the Education Data Exchange!
          </v-card-text>
          <v-card-actions>
            <v-row align="center" justify="center">
              <v-btn id="login-button" @click="clearStorage" :href="authRoutes.LOGIN_BCEID" class="ma-2" dark color='#003366'>Log In with Basic BCeID<v-icon>mdi-login</v-icon></v-btn>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import { authStore } from '../store/modules/auth';
import { mapState } from 'pinia';
import { AuthRoutes } from '../utils/constants';

export default {
  name: 'Login',
  components: {

  },
  data() {
    return {
      appTitle: import.meta.env.VUE_APP_TITLE,
      authRoutes: AuthRoutes
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated']),
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
</style>
