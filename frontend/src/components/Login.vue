<template>
  <v-container fluid class="full-height px-0">
    <v-row no-gutters justify="center" class="mb-4">
      <span class="headline"><b>Welcome to the Education Data Exchange!</b></span>
    </v-row>
    <v-row no-gutters justify="center" class="pt-4">
      <PrimaryButton id="loginWithBceidBtn" text="Log In with Basic BCeID"></PrimaryButton>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { AuthRoutes } from '@/utils/constants';
import PrimaryButton from '@/components/util/PrimaryButton';
export default {
  name: 'Login',
  components: {
    PrimaryButton,
  },
  data() {
    return {
      appTitle: process.env.VUE_APP_TITLE,
      authRoutes: AuthRoutes
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
  },
  methods: {
    clearStorage() {
      this.$store.commit('auth/setJwtToken');
    }
  }
};
</script>

<style scoped>
  .full-height{
    height: 100%;
  }
</style>
