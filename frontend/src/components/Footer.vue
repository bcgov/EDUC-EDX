<template>
  <v-footer
    color="#003366"
    dark
    absolute
    height="48px"
  >
    <v-row no-gutters>
      <v-col class="d-flex justify-center">
        <v-btn
          id="footer-home"
          variant="text"
          color="white"
          href="https://www.gov.bc.ca/"
        >
          Home
        </v-btn>
        <v-btn
          id="footer-about"
          variant="text"
          color="white"
          href="https://www2.gov.bc.ca/gov/content/about-gov-bc-ca"
        >
          About gov.bc.ca
        </v-btn>
        <v-btn
          id="footer-disclaimer"
          variant="text"
          color="white"
          href="http://gov.bc.ca/disclaimer"
        >
          Disclaimer
        </v-btn>
        <v-btn
          id="footer-privacy"
          variant="text"
          color="white"
          href="http://gov.bc.ca/privacy"
        >
          Privacy
        </v-btn>
        <v-btn
          id="footer-accessibility"
          variant="text"
          color="white"
          href="http://gov.bc.ca/webaccessibility"
        >
          Accessibility
        </v-btn>
        <v-btn
          id="footer-copyright"
          variant="text"
          color="white"
          href="http://gov.bc.ca/copyright"
        >
          Copyright
        </v-btn>
        <v-btn
          id="footer-contact"
          variant="text"
          color="white"
          href="https://www2.gov.bc.ca/gov/content/home/contact-us"
        >
          Contact Us
        </v-btn>
        <v-btn
          id="footer-contact"
          variant="text"
          color="white"
          target="_blank"
          :href="config.HELP_URL"
        >
          Help
        </v-btn>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script>
import {mapState} from 'pinia';
import {appStore} from '../store/modules/app';

export default {
  name: 'Footer',
  computed: {
    ...mapState(appStore, ['config'])
  }
};
</script>

<style>
.v-footer{
  border-top: 2px solid rgb(252, 186, 25) !important;
  min-width: 100%;
  max-height: 3em;
}
/*
.footer {
  position: fixed;
  width: 100%;
  bottom: 0;
}
*/
.v-btn--active.footer:before,
.v-btn.footer:focus:before,
.v-btn.footer:hover:before {
  background: none;
}
</style>
