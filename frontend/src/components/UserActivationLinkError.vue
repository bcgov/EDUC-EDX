<template>
  <v-container
    fluid
    class="my-16 full-height"
  >
    <!-- login article -->
    <article
      id="login-banner"
      class="top-banner"
    >
      <v-row
        align="center"
        justify="center"
        width="100%"
      >
        <v-col
          cols="12"
          xs="12"
          sm="12"
          md="12"
          lg="12"
          xl="12"
        >
          <v-main>
            <v-container fluid>
              <v-row
                align="center"
                justify="center"
              >
                <v-col
                  xs="10"
                  sm="10"
                  md="10"
                  lg="10"
                  xl="10"
                >
                  <v-card
                    class="error-card"
                    elevation="5"
                  >
                    <v-card-title class="gov-header">
                      <h4
                        id="error_text"
                        style="color:red;"
                      >
                        User Activation Link Error
                      </h4>
                    </v-card-title>
                    <v-card-text id="user_activation_error_message">
                      <span style="color: black; font-weight: bold">{{ errorMessage }}</span>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-main>
        </v-col>
      </v-row>
    </article>
  </v-container>
</template>
<script>

export default {
  name: 'UserActivationLinkError',
  data() {
    return {
      errorMessage: undefined
    };
  },
  computed: {},
  mounted() {
    this.errorMessage = this.$route.query.errorMessage;
  },
};

</script>

<style scoped>
.error-card{
  margin-top: 5%;
}
.gov-header{
  color: #003366;
}
</style>
