<template>
     <v-card>
       <v-card-title>
         <h3>Your PEN</h3>
        </v-card-title>
       <v-card-text>
         <v-row class="card-row">
            <v-text-field
              :value="student.pen"
              outlined
              readonly
              id="penContainer"
              append-icon="$copy"
              color="#003366"
              @click:append="copyClipboard"
            ></v-text-field>
            
        <v-snackbar v-model="clipboard" color="info" :timeout="2000">
          PEN Copied to Clipboard!
        </v-snackbar>

         </v-row>
         <v-divider></v-divider>
         <v-row class="card-row">
          <h4>Where can I use my PEN?</h4>
          <p>The following links lead to applications where you can use your PEN</p>
          <ul>
            <v-row>
              <v-col class="list-col">
                <li><a href="https://www2.gov.bc.ca/gov/content/education-training/k-12/support/transcripts-and-certificates">Student Transcript Service</a></li>
              </v-col>
              <v-col class="list-col">
                <li><a href="https://studentaidbc.ca/">Student Aid B.C.</a></li>
              </v-col>
            </v-row>
            <!-- student financial aid, and education planner bc , info page/help -->
            <v-row>
              <v-col class="list-col">
                <li><a href="https://www.educationplannerbc.ca/">Education Planner B.C.</a></li>
              </v-col>
              <v-col class="list-col">
                <li><a href="/">Help</a></li>
              </v-col>
            </v-row>
          </ul>
        </v-row>
      </v-card-text>
     </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      clipboard: false
    };
  },
  computed: {
    ...mapGetters('penRequest', ['student'])
  },
  methods: {
    async copyClipboard() {
      /* Get the text field */
      const copyText = document.getElementById('penContainer');

      /* Select the text field */
      copyText.select();
      copyText.setSelectionRange(0, 99999); /*For mobile devices*/

      document.execCommand('copy');
      this.clipboard = true;
    } 
  },
};
</script>

<style scoped>
.card-row{
  padding: 0 15px;
}

p{
  padding-top: 10px
}
ul{
  width: 100%;
}


</style>
