<template>
  <v-app id="app">
    <MsieBanner v-if="isIE"/>
    <Header/>
    <SnackBar></SnackBar>
    <NavBar v-if="pageTitle " :title="pageTitle"/>
    <v-main fluid class="align-start">
    <v-app-bar v-if="bannerColor !== ''"
               style="color:white;"
               :color="bannerColor"
               sticky
               dense
               height="20rem"
    ><div><h3 class="envBanner">{{ bannerEnvironment }} Environment</h3></div></v-app-bar>
    <ModalIdle v-if="isAuthenticated"/>
    <router-view/>
    </v-main>
    <Footer/>
  </v-app>
</template>

<script>
import { mapActions, mapMutations, mapGetters,mapState } from 'vuex';
import HttpStatus from 'http-status-codes';
import Header from './components/Header';
import Footer from './components/Footer';
import ModalIdle from './components/ModalIdle';
import MsieBanner from './components/MsieBanner';
import StaticConfig from './common/staticConfig';
import NavBar from '@/components/util/NavBar';
import SnackBar from '@/components/util/SnackBar';

export default {
  name: 'app',
  components: {
    Header,
    Footer,
    ModalIdle,
    MsieBanner,
    NavBar,
    SnackBar
  },
  metaInfo: {
    meta: StaticConfig.VUE_APP_META_DATA
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'loginError', 'isLoading']),
    ...mapState('app', ['pageTitle']),
    isIE() {
      return /Trident\/|MSIE/.test(window.navigator.userAgent);
    }
  },
  data() {
    return {
      bannerEnvironment: StaticConfig.BANNER_ENVIRONMENT,
      bannerColor: StaticConfig.BANNER_COLOR
    };
  },
  methods: {
    ...mapMutations('auth', ['setLoading']),
    ...mapActions('auth', ['getJwtToken', 'getUserInfo', 'logout']),
  },
  async created() {
    this.setLoading(true);
    this.getJwtToken().then(() =>
      Promise.all([this.getUserInfo()])
    ).catch(e => {
      if(! e.response || e.response.status !== HttpStatus.UNAUTHORIZED) {
        this.logout();
        this.$router.replace({name: 'error', query: { message: `500_${e.data || 'ServerError'}` } });
      }
    }).finally(() => {
      this.setLoading(false);
    });
  }
};
</script>

<style>
.envBanner {
  font-size: 0.8rem;
}

.v-application {
  font-family: 'BCSans', Verdana, Arial, sans-serif !important;
}
.v-card--flat {
  background-color: transparent !important;
}
.theme--light.application{
  background: #f1f1f1;
}
h1 {
  font-size: 1.25rem;
}
.v-toolbar__title{
  font-size: 1rem;
}

.v-btn {
    text-transform: none !important;
}

.v-alert .v-icon {
    padding-left: 0;
}

.v-alert.bootstrap-success {
  color: #234720;
  background-color: #d9e7d8 !important;
  border-color: #accbaa !important;
}

.v-alert.bootstrap-info {
  color: #4e6478;
  background-color: #eaf2fa !important;
  border-color: #b8d4ee !important;
}

.v-alert.bootstrap-warning {
  color: #81692c;
  background-color: #fef4dd !important;
  border-color: #fbdb8b !important;
}

.v-alert.bootstrap-error {
  color: #712024;
  background-color: #f7d8da !important;
  border-color: #eeaaad !important;
}

.row {
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 auto;
  margin-top: auto !important;
  margin-bottom: auto !important;
}

@media screen and (max-width: 370px) {

  .v-toolbar__title{
    font-size: 0.9rem;
    line-height: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1 {
    font-size: 0.9rem;
  }

  .v-application {
    line-height: 1.3;
  }
}

@media screen and (min-width: 371px) and (max-width: 600px) {
  .v-toolbar__title{
    font-size: 0.9rem;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1 {
    font-size: 1rem;
  }

  .v-application {
    line-height: 1.3;
  }
}

@media screen and (min-width: 601px) and (max-width: 700px) {
  .v-toolbar__title{
    font-size: 1rem;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1 {
    font-size: 1.2rem;
  }
}

.theme--light.v-btn.v-btn--disabled:not(.v-btn--text):not(.v-btn--outlined) {
  background-color: rgba(0,0,0,.12)!important;
}

</style>
