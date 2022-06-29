<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>
          <v-row no-gutters>
            <v-col :class="['d-flex','justify-space-between']">
              <div :class="['d-flex', 'flex-column']">
                <strong>{{`${user.firstName} ${user.lastName}`}}</strong>
                <span>{{user.email}}</span>
              </div>
              <div v-if="!editState">
                <PrimaryButton :id="`user-edit-button-${user.firstName}-${user.lastName}`" text="Edit" icon="mdi-pencil" :on="{click: clickEditButton}"></PrimaryButton>
              </div>
              <!-- we are in edit state below show save and cancel options-->
              <div v-else>
                <PrimaryButton :id="`user-cancel-button-${user.firstName}-${user.lastName}`" text="Cancel" class="mr-2" secondary :on="{click: clickEditButton}"></PrimaryButton>
                <PrimaryButton :id="`user-save-button-${user.firstName}-${user.lastName}`" text="Save" :on="{click: clickSaveButton}"></PrimaryButton>
              </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-chip-group v-if="!editState">
            <v-chip v-for="role in userRoles"
                    :key="role.edxRoleCode" disabled>
              {{ getRoleLabel(role) }}
            </v-chip>
          </v-chip-group>
          <!-- we are in edit state below show all roles and highlight the ones the user has -->
          <v-chip-group multiple v-else v-model="selectedRoles">
            <v-chip v-for="role in roles"
                    :key="role.edxRoleCode"
                    :value="role.edxRoleCode"
                    filter
            >
              {{ getRoleLabel(role) }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import PrimaryButton from '@/components/util/PrimaryButton';
import ApiService from '../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {ApiRoutes} from '@/utils/constants';
import {mapState} from 'vuex';

export default {
  name: 'AccessUserCard',
  components: {PrimaryButton},
  mixins: [alertMixin],
  props: {
    user: {
      type: Object,
      required: true
    },
    userRoles: {
      type: Array,
      required: true
    },
    mincode: {
      type: String,
      required: true
    },
    type: {
      validator(value) {
        return ['district', 'school'].includes(value);
      },
      type: String,
      required: true
    }
  },
  data(){
    return {
      editState: false,
      selectedRoles: []
    };
  },
  methods: {
    getRoleLabel(curRole){
      if(this.roles.length > 0) {
        return this.roles.find((role) => role.edxRoleCode === curRole.edxRoleCode).label;
      }
      return '';
    },
    clickEditButton() {
      this.editState = !this.editState;
      this.setUserRolesAsSelected();
    },
    clickSaveButton() {
      const payload = {params:
          {
            edxUserID: this.user.edxUserID,
            mincode: this.mincode,
            selectedRoles: this.selectedRoles
          }
      };
      ApiService.apiAxios.post(ApiRoutes.edx.EXCHANGE_ACCESS_ROLES_URL, payload)
        .then(()=> {
          this.setSuccessAlert('User roles have been updated.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while updating user roles. Please try again later.');
          console.log(error);
        }).finally(() => {
          this.$emit('refresh');
        });
    },
    setUserRolesAsSelected() {
      let mySelection = [];

      //look through all our roles. If user has this role, then mark the index
      this.roles.forEach((role) => {
        let result = this.userRoles.find((userRole) =>
          userRole.edxRoleCode === role.edxRoleCode
        );

        if (result) {
          mySelection.push(role.edxRoleCode);
        }
      });

      this.selectedRoles = [...mySelection];
    }
  },
  computed: {
    ...mapState('edx', ['roles'])
  }
};
</script>
