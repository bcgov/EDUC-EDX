<template>
  <v-container 
    class="containerSetup"
    fluid
  >
    <div class="border">
      <v-row>
        <v-col>
          <p>Upload Data Step</p>
        </v-col>
      </v-row>
    </div>
  
    <v-row justify="end">
      <PrimaryButton
        id="nextButton"
        class="mr-2 mb-3"           
        icon="mdi-check"
        text="Next"
        :disabled="isDisabled"
        :click-action="next"
      />
    </v-row>
  </v-container>
</template>
    
<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
    
export default {
  name: 'StepThreeUploadData',
  components: {
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
  },
  emits: ['next'],
  data() {
    return {
      isDisabled: true
    };
  },
  computed: {
          
  },
  created() {
          
  },
  methods: {
    next() {
      this.$emit('next');
    },
  }
};
</script>
      
      <style scoped>
   .containerSetup{
      padding-right: 5em !important;
      padding-left: 5em !important;
    }
  
    .border {
      border: 2px solid grey;
      border-radius: 5px;
      padding: 35px;
      margin-bottom: 2em;
    }
    
    @media screen and (max-width: 1200px) {
      .containerSetup{
        padding-right: 3em !important;
        padding-left: 3em !important;
      }
    }
  
    .form-hint{
      color: rgb(56, 89, 138);
      font-size: 14px;
    }
      </style>
      
      
    
  
