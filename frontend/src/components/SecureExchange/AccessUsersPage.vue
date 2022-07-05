<template>
  <v-container>
    <v-row>
      <v-col>
      </v-col>
      <v-col class="text-right">
        <PrimaryButton icon="mdi-plus"
                       :large-icon=true
                       id="new-user-button"
                       text="New User"
                       @click.native="newUserInviteSheet = !newUserInviteSheet"/>
      </v-col>
    </v-row>
    <v-row :class="['d-sm-flex', 'align-center', 'searchBox']">
      <v-col cols="12" md="4">
        <v-text-field id="name-text-field" label="Name" v-model="searchFilter.name" clearable></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select id="roleName-select-field" clearable :items="roles" v-model="searchFilter.roleName" item-text="label"
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
      <v-col cols="4" v-for="user in filteredUsers" :key="user.digitalID">
        <AccessUserCard @refresh="getUsersData" type="school" :mincode="mincode" :userRoles="getCurrentUserSchoolRoles(user)" :user="user"></AccessUserCard>
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
              :userRoles="roles"
              @access-user:messageSent="messageSent"
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
  name: 'AccessUsersPage',
  components: {NewUserPage, PrimaryButton, AccessUserCard, Spinner},
  data() {
    return {
      newUserInviteSheet: false,
      mincode: '',
      users: [],
      loadingUsers: true,
      filteredUsers: [],
      roleMap:undefined,
      searchFilter: {
        name: '',
        roleName: ''
      },
    };
  },
  async beforeMount() {
    if (this.roles.length === 0) {
      await this.$store.dispatch('edx/getExchangeRoles');
    }
    if(this.mincodeSchoolNames.size === 0) {
      await this.$store.dispatch('app/getMincodeSchoolNames');
    }
  },
  created() {
    this.$store.dispatch('auth/getUserInfo').then(() => {
      this.mincode = this.userInfo.activeInstituteIdentifier;
      this.getUsersData();
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
      const payload = {params: {mincode: this.mincode}};
      ApiService.apiAxios.get(ApiRoutes.edx.USERS_URL, payload)
        .then(response => {
          this.filteredUsers = this.sortUserData(response.data);
          this.users = this.filteredUsers;
        }).finally(() => {
          this.loadingUsers = false;
        });
    },
    getCurrentUserSchoolRoles(user) {
      return user.edxUserSchools.filter(userSchool => userSchool.mincode === this.mincode)[0].edxUserSchoolRoles;
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
        return user.edxUserSchools[0].edxUserSchoolRoles.some(role => role.edxRoleCode === roleName);
      }
      return true;
    },
    searchEnabled() {
      return !isNotEmptyInputParams(this.searchFilter);
    },
    messageSent() {
      this.newUserInviteSheet = !this.newUserInviteSheet;
    },
    updateUserRoles(newValue){
      this.$store.commit('edx/setRoles', newValue);
    },
    closeNewUserModal(){
      this.$store.commit('edx/setRoles', JSON.parse(JSON.stringify(this.rolesCopy)));
      this.newUserInviteSheet = false; // close the modal window.
    }

  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('edx', ['roles','rolesCopy']),
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
</style>
