<template>
  <v-container 
    class="containerSetup"
    fluid
  >
    <div class="border">
      <v-row>
        <v-col>
          <p>Please review and verify that the details on the record for the school are accurate.</p>
        </v-col>
      </v-row>

      <SchoolContactsForm
        :function-name="type"
        @school-contacts="checkIfPrincipalContactExists"
      />
    </div>

    <v-row justify="end">
      <PrimaryButton
        id="nextButton"
        class="mr-2 mb-3"           
        icon="mdi-check"
        text="Verify 1601 as Correct and Continue"
        :disabled="isDisabled"
        :click-action="next"
      />
    </v-row>
    <v-row
      v-if="isDisabled"
      justify="end"
    >
      <p class="form-hint">
        A principal with an active start date must be added
      </p>
    </v-row>
  </v-container>
</template>
  
<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
import SchoolContactsForm from '../common/forms/SchoolContactsForm.vue';
import {isContactCurrent} from '../../utils/institute/status';
  
export default {
  name: 'StepTwoSchoolContacts',
  components: {
    PrimaryButton,
    SchoolContactsForm
  },
  mixins: [alertMixin],
  props: {
   
  },
  emits: ['next'],
  data() {
    return {
      isDisabled: false,
      type: 'SLD',
      schoolCollectionID: this.$route.params.schoolCollectionID
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
    checkIfPrincipalContactExists(contacts) {
      let contact = contacts.filter(contact => contact.schoolContactTypeCode === 'PRINCIPAL' && isContactCurrent(contact));
      if(contact.length > 0) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    }
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
    
    
  
