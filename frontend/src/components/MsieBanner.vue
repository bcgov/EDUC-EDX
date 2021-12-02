<template>
  <v-alert
    id="banner"
    dense
    type="error"
    dismissible
  >
    Your current web browser, Microsoft Internet Explorer, is not supported for this service. Use one of these web browsers: Microsoft Edge, Mozilla Firefox, Google Chrome, or Apple Safari.
  </v-alert>
</template>

<style scoped>

#banner {
  color: #81692c;
  background-color: #fef4dd !important;
  /* display: flex;
  justify-content: center; */
}

#banner /deep/ .v-icon {
  color: #81692c;
}

#banner /deep/ .v-btn {
  padding-top: 32px;
}

#banner /deep/ .v-alert__wrapper {
  align-items: flex-start;
  width: 800px;
  margin: 0 auto;
  max-width: 100vw;
}

</style>
