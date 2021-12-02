<template>
    <v-container class="login-cards" style="padding-bottom: 1vh">
      <v-row justify=center align=center>
          <v-card>
            <v-card-text>
            You are not logged in. Redirecting to the login page...
            </v-card-text>
          </v-card>
      </v-row>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { AuthRoutes } from '@/utils/constants';
export default {
  name: 'Login',
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
  .v-icon{
    padding-left: 10px;
  }
  .login-card{
      padding-left: 5%;
      max-width: 95%;
  }
  .gov-header{
    color: #003366;
  }
  .v-btn{
    text-transform: none
  }
  .banner-image{
    background-image: url('/assets/bceid_logo.jpg');
  }
  .login-cards{
    max-width:80%;
    margin: 2rem;
  }
  /* .v-card__text{
    padding-top: 0px; 
  } */
  .img-card{
    height: auto !important;
    width: 90%;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .card-bold{
    color: #1a5a96;
  }
  .login-card-text{
    font-size: 0.95rem
  }
  hr{
    margin: 0 1rem;
    color: #ededed
  }
  .v-card__actions{
    padding: 1rem;
    padding-top: 0.3rem;
  }

  .v-application a{
    color: #1a5a96
  }
  .v-card__text{
    font-size: 1.2rem
  }
  .img-holder{
    height: 10rem;
    margin: auto
  }
  .bcsc{
    padding-top: 1rem;
  }

  @media screen and (max-width: 801px){
    .img-holder{
      height: auto;
    }
  }
   @media screen and (max-width: 400px) {
     .login-cards{
       margin-bottom: 7rem;
       margin-top: 2rem;
       max-width:80%;
     }
    .v-card__text{
      height: auto;
    }
    .img-holder{
      height: auto;
    }
   }
</style>
