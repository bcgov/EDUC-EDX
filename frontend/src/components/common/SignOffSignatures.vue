<template>
    <v-container
      id="signatureTab"
      fluid
    >
    <div v-if="isLoading">
      <v-row>
        <v-col class="d-flex justify-center">
          <v-progress-circular
            class="mt-16"
            :size="70"
            :width="7"
            color="primary"
            indeterminate
            :active="isLoading"
          />
        </v-col>
      </v-row>
    </div>

      <v-table v-else>
        <thead>
            <tr class="header-row">
                <th class="sign-table header-text">
                    Sign-Off Actions
                </th>
                <th class="header-text">
                    Sign-Off Details
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="data in actionData"
                :key="data.role"
            >
                <td>
                    <v-btn
                        :id="data.role + '-button'"
                        color="#003366"
                        width="90%"
                        :text="data.buttonText"
                        class="mt-3 mb-3"
                        :disabled="data.isDisabled"
                        @click="submit(data)"
                    />
                </td>
                <td v-if="data.signOffDetails">
                    <v-icon color="green-darken-2">
                        mdi-check-circle-outline
                    </v-icon> {{ data.signOffDetails }}</td>
                <td v-else>-</td>
            </tr>
        </tbody>
      </v-table>
    </v-container>
  </template>
      
  <script>
  import alertMixin from '../../mixins/alertMixin';
  import PrimaryButton from '../util/PrimaryButton.vue';
  import {mapState} from 'pinia';
  import {authStore} from '../../store/modules/auth';
  import {sdcCollectionStore} from '../../store/modules/sdcCollection';
  import ApiService from '../../common/apiService';
  import {ApiRoutes} from '../../utils/constants';
  import {setSuccessAlert, setFailureAlert} from '../composable/alertComposable';
  import {LocalDateTime, DateTimeFormatter} from '@js-joda/core';
  import {capitalize} from 'lodash';

  export default {
    name: 'SignOffSignatures',
    components: {
        PrimaryButton
    },
    mixins: [alertMixin],
    props: {
      district: {
        type: Object,
        required: true,
        default: null
      },
      districtCollectionObject: {
      type: Object,
      required: true,
      default: null
    },
    },
    emits: [],
    data() {
      return {
        isLoading: true,
        users: [],
        actionData: [
            {
                role: 'DIS_SDC_EDIT',
                buttonText: '1701 Sign Off',
                signOffDetails: '',
                isDisabled: true
            },
            {
                role: 'SUPERINT',
                buttonText: 'Superinendent Sign Off',
                signOffDetails: '',
                isDisabled: true
            },
            {
                role: 'SECR_TRES',
                buttonText: 'Secretary Treasurer Sign Off',
                signOffDetails: '',
                isDisabled: true
            }
        ]
      };
    },
    computed: {
        ...mapState(authStore, ['userInfo']),
        ...mapState(sdcCollectionStore, ['districtCollection']),
    },
     mounted() {
        sdcCollectionStore().getDistrictCollection(this.$route.params.sdcDistrictCollectionID).finally(async () => {
            this.setButtons();
            await this.getUsersData();
            this.isLoading = !this.isLoading;
        });
    },
    created() {
    },
    methods: {
    async refreshDistrictCollection() {
         sdcCollectionStore().getDistrictCollection(this.$route.params.sdcDistrictCollectionID).finally(async () => {
            await this.getUsersData(); 
            this.isLoading = !this.isLoading;
        });
    },
    setButtons() {
        if (this.userInfo.activeInstitutePermissions.includes('DIS_SDC_EDIT')) {
                this.actionData.filter(data => data.role === 'DIS_SDC_EDIT').map(v => v.isDisabled = false);
            } 
            if (this.userInfo.activeInstitutePermissions.includes('SUPERINT')) {
                this.actionData.filter(data => data.role === 'SUPERINT').map(v => v.isDisabled = false);
            } 
            
            if (this.userInfo.activeInstitutePermissions.includes('SECR_TRES')) {
                this.actionData.filter(data => data.role === 'SECR_TRES').map(v => v.isDisabled = false);
            } 
    },

     submit(selectedAction) {
            this.isLoading = true;
            const payload = {districtSignatoryRole: selectedAction?.role};
            ApiService.apiAxios.post(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}/sign-off`, payload)
            .then(() => {
                setSuccessAlert('Success! The student details have been updated.');
            })
            .catch(error => {
            console.error(error);
            setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while submitting signature for sign-off. Please try again later.');
            }).finally(async () => {
                 await this.refreshDistrictCollection();
            });
        },

     async getUsersData() {
        const payload = {params: {districtID: this.districtCollection.districtID}};
       await ApiService.apiAxios.get(ApiRoutes.edx.USERS_URL, payload)
        .then(response => {
          this.users = response.data;
          let signatures = this.districtCollection.submissionSignatures;
          for(let user of signatures) {
            const matched = this.users.find(val => {
                const signatoryID = user.districtSignatoryUserID.split('/');
                return val.edxUserID === signatoryID[1];
            });

            if(matched) {
                this.actionData.filter(data => data.role === user.districtSignatoryRole).map(v => {
                    v.signOffDetails = this.mapRoletext(user.districtSignatoryRole) + ' : ' + capitalize(matched.firstName) + ' ' + capitalize(matched.lastName) + ', ' + 
                        LocalDateTime.parse(user.signatureDate).format(DateTimeFormatter.ofPattern('uuuu-MM-dd')) + ', ' +
                        LocalDateTime.parse(user.signatureDate).format(DateTimeFormatter.ofPattern('HH:mm'));
                    v.isDisabled = true
                });
            } 
        }
        });
    },
    mapRoletext(role) {
        switch(role) {
            case 'DIS_SDC_EDIT':
                return '1701 Contact Sign Off';
            case 'SUPERINT':
                return 'Superinendent Sign Off';
            case 'SECR_TRES':
                return 'Secretary-Treasurer Sign Off';
            default:
                return '';
        }
    }
    
}
  }
  </script>
  
  <style scoped>
    .sign-table {
        width: 20%;
    }
    .header-row {
    border-bottom-style: groove;
    border-bottom-color: rgb(255 255 255 / 45%);
 }
 .header-text {
  color: #7f7f7f;
}
  </style>
        
        
      
    
  