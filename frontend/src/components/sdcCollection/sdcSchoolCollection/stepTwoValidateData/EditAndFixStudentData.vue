<template>
  <v-card
    id="editAndFixCard"
  >
    <v-card-title
      id="viewStudentCardTitle"
      class="sheetHeader pt-1 pb-1"
    >
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Edit Student
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="cancel"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <EditStudent
        :selected-students="selectedStudents"
        :total-students="totalStudents"
        :remove-event="removeStudent"
        @form-validity="isValid"
        @reset-parent="reset()"
        @show-issues="cancel"
        @reset-pagination="resetPagination"
      />
    </v-card-text>
  </v-card>
</template>
<script>


import EditStudent from '../../../common/EditStudent.vue';

export default {
  name: 'EditAndFixStudentData',
  components: {
    EditStudent
  },
  props: {
    selectedStudents: {
      type: Array,
      required: true,
      default: null
    },
    totalStudents: {
      type: Number,
      required: false,
      default: null
    }
  },
  emits: ['next', 'close', 'reset-pagination', 'reload-students'],
  data() {
    return {
      removeStudent: false,
      studentDetailsFormValid: true
    };
  },
  computed: {

  },
  watch: {
   
  },
  mounted() {
  },
  async created() {

  },
  methods: {
    resetPagination() {
      this.$emit('reset-pagination');
    },
    isValid($event) {
      this.studentDetailsFormValid = $event;
    },
    reset() {
      this.removeStudent=false;
      this.$emit('reload-students');
    },
    cancel() {
      this.$emit('close');
    },
  }
};
</script>

<style scoped>
 .containerSetup{
    padding-right: 0em !important;
    padding-left: 0em !important;
  }

  .border {
    border: 2px solid grey;
    border-radius: 5px;
    padding: 35px;
    margin-bottom: 2em;
  }

  .clear-message {
    border: 1px solid darkgreen;
    color: darkgreen;
    background-color: transparent;
    padding: 10px;
  }

 .inner-border {
   display: inline-block;
   min-width: 100%;
   border: 1px solid rgba(42, 45, 38, 0.38);
   border-radius: 5px;
   padding: 2em;
   margin-bottom: 2em;
 }

  @media screen and (max-width: 1200px) {
    .containerSetup{
      padding-right: 3em !important;
      padding-left: 3em !important;
    }
  }

  .footer-text {
    font-style: italic;
    color: grey;
  }

  .filter-text {
    font-style: italic;
    color: rgb(56, 89, 138);
  }

  .filter-text:hover {
  text-decoration: underline;
  }

  .success-message{
    vertical-align: sub;
   }

  .sheetHeader {
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
  }

  .v-banner::v-deep .v-banner__content {
    justify-content: space-between !important;
  }

</style>
