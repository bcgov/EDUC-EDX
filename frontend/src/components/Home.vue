<!--suppress ALL -->
<template>
  <v-container fluid class="full-height" v-if="!isAuthenticated && !isLoading">
    <ModalJourney/>
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
	<v-row justify=center :class="{'px-16': $vuetify.breakpoint.xlAndUp, 'mx-16': $vuetify.breakpoint.xl }">
      <v-col cols="10" xl="8" lg="8" md="10" sm="10" xs="10" :class="{'px-16': $vuetify.breakpoint.xl }">
          <p >If you are currently attending a K-12 school, please request your PEN or update your personal information by contacting the main office at your school
             <ul class="pl-8" style="list-style-position: outside;">
               <li><a href="http://www.bced.gov.bc.ca/apps/imcl/imclWeb/Home.do" rel="noopener noreferrer" target="_blank">Find your school's contact information</a></li>
             </ul>
          </p>
      </v-col>
	</v-row>
    <v-row justify=center>
      <v-col cols="12" lg="6" class="px-8">
        <v-card :class="{'px-16': $vuetify.breakpoint.lgAndUp }" class="px-4 py-4" style="height: 100%;">
          <p style="text-align:center">
            <router-link to="gmp">
              <img id="gmpLink" alt="Find PEN" src="@/assets/images/icon-find-pen.svg" style="display:block; float:initial; margin:auto" title="Find PEN">Get your Personal Education<br>Number (PEN)
            </router-link>
          </p>
          <p class="my-1">Former students can send a request via an online form to receive their PEN
          </p>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6" class="px-8">
        <v-card :class="{'px-16': $vuetify.breakpoint.lgAndUp }" class="px-4 py-4" style="height: 100%;">
          <p style="text-align:center">
            <router-link to="ump">
              <img id="umpLink" alt="Update My PEN" src="@/assets/images/updatemypen.svg" style="display:block; float:initial; margin:auto" title="Update My PEN">Update your PEN information
            </router-link>
          </p>
          <p class="my-1">Former students can update their personal information associated with their PEN so that transcripts display current legal name
          </p>
          <ul style="text-align:left; list-style-position: outside;" :class="{'px-16': $vuetify.breakpoint.lgAndUp }">
            <li>
              You cannot change your Personal Education Number (PEN)
            </li>
          </ul>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Login from './Login';
import ModalJourney from './ModalJourney';
import { mapGetters } from 'vuex';

export default {
  name: 'home',
  components: {
    Login,
    ModalJourney,
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

