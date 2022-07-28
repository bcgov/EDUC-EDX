<!--suppress ALL -->
<template>
  <v-container fluid class="full-height">
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="6">
        <v-row>
          <v-col><h3>Which Dashboard would you like to access?</h3></v-col>
        </v-row>
        <v-data-table
          :items="activeMincodes"
          class="elevation-1"
          hide-default-header
          :headers="headers"
          mobile-breakpoint="0"
          hide-default-footer
          :loading="isTableLoading"
        >
          <template v-slot:item.mincode="{ item }">
            <v-row @click="selectInstitution(item.mincode)" style="cursor: pointer;">
              <v-col cols="7" md="10">
                <v-row>
                  <v-col cols="7" md="10">
                    <h3 style="color: black;">{{getSchoolName(item.mincode)}}</h3>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="7" md="10">
                    <h3 style="color: grey;">{{item.mincode}}</h3>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>

  </v-container>
</template>

<script>

import {mapState} from 'vuex';
import ApiService from '../common/apiService';
import {ApiRoutes} from '@/utils/constants';

export default {
  name: 'InstituteSelection',
  components: {
  },
  data() {
    return {
      isTableLoading: true,
      headers: [
        {
          text: 'Mincode',
          align: 'start',
          sortable: false,
          value: 'mincode',
          width: '200px',
        }
      ],
    };
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('auth', ['userInfo']),
    activeMincodes() {
      if (!this.userInfo?.userMinCodes) {
        return [];
      }
      return this.userInfo.userMinCodes.map(function (value) {
        return {
          'mincode': value
        };
      });
    }
  },
  created() {
    this.isTableLoading = true;
    this.$store.dispatch('app/getMincodeSchoolNames').finally(() => {
      this.isTableLoading = false;
    });
  },
  methods: {
    getSchoolName(mincode) {
      return this.mincodeSchoolNames.get(mincode);
    },
    selectInstitution(mincode){
      const payload = {params: {mincode: mincode}};
      ApiService.apiAxios.post(ApiRoutes.edx.INSTITUTE_SELECTION_URL, payload)
        .then(()=> {
          this.$router.push({name: 'home'});
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.top-banner{
  background-color: aliceblue;
  background-size: cover;
  align-items: center;
  display: flex;
}
.full-height{
  height: 50%;
}
</style>

