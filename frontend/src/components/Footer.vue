<template>
  <v-footer color="#003366" dark absolute height="20px">
    <v-row no-gutters>
      <v-col class="d-flex justify-center">
        <v-btn variant="text" color="white" id="footer-home" href="https://www.gov.bc.ca/">Home</v-btn>
        <v-btn variant="text" color="white" id="footer-about" href="https://www2.gov.bc.ca/gov/content/about-gov-bc-ca">About gov.bc.ca</v-btn>
        <v-btn variant="text" color="white" id="footer-disclaimer" href="http://gov.bc.ca/disclaimer">Disclaimer</v-btn>
        <v-btn variant="text" color="white" id="footer-privacy" href="http://gov.bc.ca/privacy">Privacy</v-btn>
        <v-btn variant="text" color="white" id="footer-accessibility" href="http://gov.bc.ca/webaccessibility">Accessibility</v-btn>
        <v-btn variant="text" color="white" id="footer-copyright" href="http://gov.bc.ca/copyright">Copyright</v-btn>
        <v-btn variant="text" color="white" id="footer-contact" href="https://www2.gov.bc.ca/gov/content/home/contact-us">Contact Us</v-btn>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script>
export default {};
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
