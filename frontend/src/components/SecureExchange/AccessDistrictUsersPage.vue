<template>
  <v-container>
    <v-row>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon class="mt-1" small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1 mt-1" @click="backButtonClick">Return to Dashboard</a>
      </v-col>
      <v-col class="d-flex justify-end">
        <v-chip
          :color="getChipColor()"

        >
          <v-icon left>
            mdi-shield-key-outline
          </v-icon>Primary Activation Code:
          {{ this.primaryEdxActivationCode ? this.primaryEdxActivationCode.activationCode : `Code Not Found` }}
        </v-chip>
      </v-col>
    </v-row>
    <v-row :class="['d-sm-flex', 'align-center', 'searchBox']">
      <v-col cols="12" md="4">
        <v-text-field id="name-text-field" label="Name" v-model="searchFilter.name" clearable></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select id="roleName-select-field" clearable :items="districtRoles" v-model="searchFilter.roleName" item-text="label"
                  item-value="edxRoleCode" label="Role"></v-select>
      </v-col>
      <v-col cols="12" md="4" :class="['text-right']">
        <PrimaryButton id="user-search-button" text="Clear" secondary @click.native="clearButtonClick"/>
        <PrimaryButton id="user-clear-button" text="Search" class="ml-2" @click.native="searchButtonClick"
                       :disabled="searchEnabled()"/>
      </v-col>
    </v-row>
    <!--  user info -->
    <Spinner v-if="loadingUsers"/>
    <v-row v-else-if="filteredUsers.length">
      <v-col xl="4" cols="6" class="pb-0" v-for="user in filteredUsers" :key="user.digitalID">
        <AccessUserCard @refresh="getUsersData" :userRoles="getCurrentUserDistrictRoles(user)" :user="user" :institute-code="districtID" :institute-roles="districtRoles" institute-type-code="DISTRICT" institute-type-label="District"></AccessUserCard>
      </v-col>
      <v-col xl="4" cols="6" >
        <v-row>
          <v-col style="height: 180px">
            <v-card height="100%">
              <v-card-title>
                <v-row no-gutters>
                  <v-col class="d-flex justify-center mt-10">
                    <PrimaryButton icon="mdi-plus"
                                   :large-icon=true
                                   id="new-user-button"
                                   secondary
                                   text="Add New User"
                                   @click.native="newUserInviteSheet = !newUserInviteSheet"/>
                  </v-col>
                </v-row>
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row  v-else>
      <v-col class="d-flex justify-center">
        No users found
      </v-col>
    </v-row>

    <v-bottom-sheet
        v-model="newUserInviteSheet"
        inset
        no-click-animation
        scrollable
        persistent
    >
      <v-card
          id="newUserInviteVCard"
          v-if="newUserInviteSheet"
          class="information-window-v-card">
        <v-card-title id="newUserInviteVCardTitle" class="sheetHeader pt-1 pb-1">New User</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <NewUserPage
              :userRoles="districtRoles"
              :userInfo="userInfo"
              :districts-map="districtsMap"
              @access-user:messageSent="closeNewUserModal"
              @access-user:updateRoles="updateUserRoles"
              @access-user:cancelMessage="closeNewUserModal"
          >
          </NewUserPage>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>

</template>

<script>

import ApiService from '../../common/apiService';
import {setEmptyInputParams} from '@/utils/common';
import {isNotEmptyInputParams} from '@/utils/validation';
import {ApiRoutes} from '@/utils/constants';
import {mapGetters, mapState} from 'vuex';
import PrimaryButton from '@/components/util/PrimaryButton';
import AccessUserCard from './AccessUserCard';
import NewUserPage from '@/components/SecureExchange/NewUserPage';
import Spinner from '@/components/common/Spinner';

export default {
  name: 'AccessDistrictUsersPage',
  components: {NewUserPage, PrimaryButton, AccessUserCard, Spinner},
  data() {
    return {
      newUserInviteSheet: false,
      districtID: '',
      users: [],
      loadingUsers: true,
      filteredUsers: [],
      roleMap:undefined,
      searchFilter: {
        name: '',
        roleName: ''
      },
      primaryEdxActivationCode: null
    };
  },
  async beforeMount() {
    if (this.districtRoles.length === 0) {
      await this.$store.dispatch('edx/getDistrictExchangeRoles');
    }
    if(this.districtsMap.size === 0) {
      await this.$store.dispatch('app/getInstitutesData');
    }
  },
  created() {
    this.$store.dispatch('auth/getUserInfo').then(() => {
      this.districtID = this.userInfo.activeInstituteIdentifier;
      this.getUsersData();

      if(this.userInfo.activeInstituteType === 'DISTRICT') {
        this.getPrimaryEdxActivationCodeDistrict();
      }
    });

  },
  methods: {
    sortUserData(users){
      return users.sort((a, b) => {
        if (a.firstName > b.firstName) {
          return 1;
        } else if (a.firstName < b.firstName) {
          return -1;
        }
        return 0;
      } );
    },
    getUsersData() {
      this.loadingUsers = true;
      const payload = {params: {districtID: this.districtID}};
      ApiService.apiAxios.get(ApiRoutes.edx.USERS_URL, payload)
        .then(response => {
          this.filteredUsers = this.sortUserData(response.data);
          this.users = this.filteredUsers;
        }).finally(() => {
          this.loadingUsers = false;
        });
    },
    getCurrentUserDistrictRoles(user) {
      return user.edxUserDistricts.filter(userDistrict => userDistrict.districtID === this.districtID)[0].edxUserDistrictRoles;
    },
    clearButtonClick() {
      setEmptyInputParams(this.searchFilter);
      this.searchButtonClick();
    },
    searchButtonClick() {
      this.filteredUsers = this.users
        .filter(user => {
          return this.nameFilter(user, this.searchFilter?.name) && this.roleFilter(user, this.searchFilter?.roleName);
        });
    },
    nameFilter(user, name) {
      if (name) {
        return `${user.firstName} ${user.lastName}`.toLowerCase().includes(name.toLowerCase());
      }
      return true;
    },
    roleFilter(user, roleName) {
      if (roleName) {
        return user.edxUserDistricts[0].edxUserDistrictRoles.some(role => role.edxRoleCode === roleName);
      }
      return true;
    },
    backButtonClick() {
      this.$router.push({name: 'home'});
    },
    searchEnabled() {
      return !isNotEmptyInputParams(this.searchFilter);
    },
    updateUserRoles(newValue){
      this.$store.commit('edx/setDistrictRoles', newValue);
    },
    getChipColor(){
      if(this.primaryEdxActivationCode){
        return 'success';
      }
      return 'secondary';
    },
    closeNewUserModal(){
      this.$store.commit('edx/setDistrictRoles', JSON.parse(JSON.stringify(this.districtRolesCopy)));
      this.newUserInviteSheet = false; // close the modal window.
    },
    getPrimaryEdxActivationCodeDistrict() {
      ApiService.apiAxios.get(`${ApiRoutes.edx.PRIMARY_ACTIVATION_CODE_URL}/DISTRICT/${this.districtID}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
        }).catch(e => {
          this.primaryEdxActivationCode = null;
          console.log(e);
        });
    },
  },
  computed: {
    ...mapState('app', ['districtsMap']),
    ...mapState('edx', ['districtRoles','districtRolesCopy']),
    ...mapGetters('auth', ['userInfo']),
  }
};
</script>

<style scoped>
.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.divider {
  border-color: #FCBA19;
  border-width: medium;
}

.searchBox {
  padding-left: 1em;
  padding-right: 1em;
  margin-left: 0;
  margin-right: 0;
  border-radius: 5px;
  background-color: #F2F2F2;
}

.card-hint {
  color: #000 !important;
  font-size: 1rem;
}
.v-dialog__content >>> .v-bottom-sheet {
  width: 30% !important;
}

@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
}

</style>
