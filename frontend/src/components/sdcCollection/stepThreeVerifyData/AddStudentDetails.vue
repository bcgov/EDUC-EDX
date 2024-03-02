<template>
    <v-card
      id="viewStudentCard"
    >
      <v-card-title
        id="viewStudentCardTitle"
        class="sheetHeader pt-1 pb-1"
      >
        Student Details
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-col
            class="d-flex justify-end"
          >
            <v-btn
              id="cancel"
              color="#003366"
              text="Cancel"
              variant="outlined"
              @click="cancel"
            />
  
            <v-btn
              id="save"
              color="#003366"
              text="Save"
              class="ml-3"
              :disabled="!studentDetailsFormValid"
              @click="save"
            />
          </v-col>
        </v-row>
  
        <EditStudent
          :selected-students="selectedStudent"
          :total-students="1"
          :save-event="saveStudent"
          :function-type="type"
          @form-validity="isValid"
          @reset-parent="reset()"
          @student-object="setStudentContext"
          @close-success="openinEditMode"
        />
      </v-card-text>
    </v-card>
  </template>
    
  <script>
  import alertMixin from '../../../mixins/alertMixin';
  import EditStudent from '../../common/EditStudent.vue';
  import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
    
  export default {
    name: 'AddStudentDetails',
    components: {
      EditStudent
    },
    mixins: [alertMixin],
    props: {
    },
    emits: ['close', 'open-edit'],
    data() {
      return {
        selectedStudent: [],
        studentDetailsFormValid: false,
        saveStudent: false,
        sdcCollection: sdcCollectionStore(),
        studentDetails: {},
        type: 'add'
      };
    },
    created() {

    },
    mounted() {
        
    },
    methods: {
      setStudentContext($event) {
        this.studentDetails = $event;
      },
      save() {
        this.saveStudent =true;
      },
      cancel() {
        this.$emit('close');
      },
      isValid($event) {
        this.studentDetailsFormValid = $event;
      },
      reset() {
        this.saveStudent =false;
      },
      openinEditMode($event) {
        this.$emit('open-edit', $event);
      }
    }
  };
  </script>
    
    <style scoped>
      .sheetHeader {
          background-color: #003366;
          color: white;
          font-size: medium !important;
          font-weight: bolder !important;
      }
  
      .headerVal{
      color: #7f7f7f;
   }
    </style>
    
  