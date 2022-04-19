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


  </v-container>
</template>

<script>
import Login from './Login';
import { mapGetters } from 'vuex';

export default {
  name: 'home',
  components: {
    Login,
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'isLoading']),
  },
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

