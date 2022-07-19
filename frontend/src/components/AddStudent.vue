<template>
  <v-card class="add-student">

    <v-alert
        dense
        outlined
        dismissible
        v-model="alert"
        :class="alertType"
        class="mb-3"
    >
      {{ alertMessage }}
    </v-alert>
    <v-form
        ref="form"
        v-model="validForm"
    >
      <v-row row d-flex nowrap align="center" justify="center" class="px-2">
        <v-text-field class="pr-5"
                      clearable
                      v-model="penNumber"
                      placeholder="Enter a Student's PEN"
                      :rules="penRules"
                      counter="9">
        </v-text-field>
        <PrimaryButton width="7rem" :disabled="enableSearchButton" id="searchPenBtn" text="Search"
                       :loading="isSearchingStudent"
                       @click.native="searchStudentForGivenPEN"/>
      </v-row>
    </v-form>
    <v-row no-gutters v-if="showStudentDetails">
      <v-icon x-large v-if="showStudentDetails" class="pr-2">mdi-account-box-outline</v-icon>
      <div v-if="showStudentDetailsForMinistryStaff" :class="['d-flex', 'flex-column']">
      <span class="pt-2 pl-0 pb-2" >Student details will be available for ministry staff. </span>
      </div>
        <div v-if="showStudentDetails" :class="['d-flex', 'flex-column']">
          <strong>{{ this.student['studentName'] }}</strong>
          <span>{{ this.student['studentLocalID'] }}</span>
          <span>{{ this.student['studentDoB'] }}</span>
          <span>{{ this.student['studentGender'] }}</span>
        </div>
    </v-row>
    <v-row class="justify-end pr-2 pt-2" >
      <PrimaryButton id="cancelMessage" secondary text="Cancel" class="mr-1"
                     @click.native="closeForm"></PrimaryButton>
      <PrimaryButton :disabled="!studentExist" id="addStudentBtn"
                     text="Add" width="7rem" @click.native="addStudentToMessage"></PrimaryButton>
    </v-row>
  </v-card>
</template>

<script>
import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from './util/PrimaryButton';
import {isValidPEN} from '@/utils/validation';
import {ApiRoutes} from '@/utils/constants';

export default {
  components: {PrimaryButton},
  mixins: [alertMixin],
  props: {
    eager: {
      type: Boolean,
      default: false
    },
    mincode: {
      type: String,
      required: true
    },
    additionalStudentAddWarning:{
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      isSearchingStudent: false,
      showStudentDetails: false,
      showStudentDetailsForMinistryStaff:false,
      penNumber: null,
      validForm: false,
      penRules: [v => (!v || isValidPEN(v))],
      studentExist: false,
      student: {},
      alert: false,
      alertMessage: null,
      alertType: null
    };
  },
  computed: {

    enableSearchButton() {
      return !(isValidPEN(this.penNumber));
    }
  },
  watch: {
    addtionalStudentAddWarning(newVal){
      if(newVal){
        this.setInfoAlert(newVal);
      }
    },
    alert(newVal){
      if(!newVal){
        this.additionalStudentAddWarning = '';
      }
    },
    penNumber(newVal) {
      if (!(isValidPEN(newVal))) {
        this.student = {};
        this.showStudentDetails=false;
        this.showStudentDetailsForMinistryStaff=false;
        this.studentExist=false;
        this.alert = false;
      }
    },



  },
  methods: {
    setErrorAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    setInfoAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-info';
      this.alert = true;
    },
    searchStudentForGivenPEN() {
      this.isSearchingStudent = true;
      this.studentExist = false;
      this.student = {};
      ApiService.apiAxios.get(ApiRoutes.studentRequest.SEARCH_URL, {
        params: {
          pen: this.penNumber,
          mincode: this.mincode
        }
      })
        .then(response => {
          this.populateStudentInfoCard(response.data);
        })
        .catch(error => {
          if (error?.response?.data?.message) {
            this.setErrorAlert(error?.response?.data?.message);
          } else {
            this.setErrorAlert('PEN must be a valid PEN associated with a student at the Ministry of Education and Childcare');
          }
        }).finally(() => {
          this.isSearchingStudent = false;
        });

    },
    populateStudentInfoCard(data) {
      this.alert = false;
      this.studentExist = true;
      this.showStudentDetails = true;
      this.student = {};
      if (!data.firstName) {
        this.student['studentID'] = data.studentID;
        this.student['pen']=data.pen;
        this.showStudentDetailsForMinistryStaff=true;
      } else {
        this.student['pen']=data.pen;
        this.student['studentID'] = data.studentID;
        this.student['studentName'] = data.firstName + ' ' + (data.middleName ?? '') + ' ' + data.lastName;
        this.student['studentLocalID'] = data.localID;
        this.student['studentGender'] = data.gender;
        this.student['studentDoB'] = data.doB;
        this.showStudentDetailsForMinistryStaff=false;
      }
      console.info(this.student);
    },
    closeForm() {
      this.resetForm();
      this.$emit('close:form');
    },
    resetForm() {
      this.$refs.form.reset();
      this.alert = false;
      this.alertMessage = null;
    },
    validate() {
      this.$refs.form.validate();
    },
    addStudentToMessage() {
      let secureExchangeStudent = {
        studentID: this.student['studentID'],
        pen: this.student['pen'],

      };
      this.$emit('addStudent', secureExchangeStudent);
      this.resetForm();
      this.$emit('close:form');
    },
  },


};
</script>

<style scoped>
.add-student {
  padding: 1.1rem;
  max-width: 50rem;
  min-width: 10rem;
}

p {
  padding-top: 10px;
}

ul {
  width: 100%;
}


h3 {
  font-size: 1.2rem
}

</style>
