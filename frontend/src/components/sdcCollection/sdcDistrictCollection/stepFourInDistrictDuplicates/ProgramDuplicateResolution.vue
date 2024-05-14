<template>
    <v-card
      id="programDuplicate"
    >
      <v-card-title
        id="programDuplicateTitle"
        class="sheetHeader pt-1 pb-1"
      >
        <v-row no-gutters>
          <v-col class="d-flex justify-start">
            Resolve Program Duplicates
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
        here
      </v-card-text>
    </v-card>
  </template>
  <script>
  
  
  
  export default {
    name: 'ProgramDuplicateResolution',
    components: {
      
    },
    props: {
     
    },
    emits: ['close'],
    data() {
      return {
       
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
  