<template>
  <v-container class="containerSetup" fluid>
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="loading"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <v-row v-else no-gutters>
      <v-col>
        <v-row  class="d-flex justify-start">
          <v-col cols="6" class="d-flex justify-start">
            <h2 id="districtName">{{ district.districtNumber }} - {{ district.displayName }}</h2>
          </v-col>
          <v-col cols="6" class="d-flex justify-end">
            <PrimaryButton width="6em" icon="mdi-pencil" text="Edit"></PrimaryButton>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col  lg="2" sm="4">
            <v-icon class="pb-1" :color="getStatusColor()" right dark>
              mdi-circle-medium
            </v-icon>
            <span class="fontBolder">{{getStatusText()}}</span>
          </v-col>
          <v-col lg="2" sm="4">
            <v-icon class="mb-1" aria-hidden="false">
              mdi-phone-outline
            </v-icon>
            <span class="fontBolder">{{ district.phoneNumber }}</span>
          </v-col>
          <v-col lg="3" sm="4">
            <v-icon class="mb-1" aria-hidden="false">
              mdi-at
            </v-icon>
            <span class="fontBolder">{{ district.email }}</span>
          </v-col>
          <v-col lg="2" sm="4">
            <v-icon class="mb-1" aria-hidden="false">
              mdi-fax
            </v-icon>
            <span class="fontBolder">{{ district.faxNumber }}</span>
          </v-col>
          <v-col  lg="3" sm="4">
            <v-icon class="mb-1" aria-hidden="false">
              mdi-web
            </v-icon>
            <span class="fontBolder">{{ district.website }}</span>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-divider class="divider"></v-divider>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col cols="12" class="d-flex justify-start">
            <h2>Addresses</h2>
          </v-col>
        </v-row>
        <v-row no-gutters class="d-flex justify-start">
          <v-col v-if="hasMailingAddress()" cols="3">
            <v-row>
              <v-col>
                <v-icon class="pb-1" right >
                  mdi-email-outline
                </v-icon>
                <span>Mailing Address</span>
              </v-col>
            </v-row>
            <v-row class="ml-8 fontBolder" no-gutters>
              <v-col>
                <span>{{ getMailingAddressItem('addressLine1') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-8 fontBolder">
                <span>{{ getMailingAddressItem('addressLine2') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-8 fontBolder">
                <span>{{ getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode')  + ', ' + getMailingAddressItem('countryCode') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-8 fontBolder">
                <span>{{ getMailingAddressItem('postal') }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3">
            <v-row>
              <v-col>
                <v-icon class="pb-1" right >
                  mdi-home-outline
                </v-icon>
                <span>Physical Address</span>
              </v-col>
            </v-row>
            <v-row v-if="!hasSamePhysicalAddress()" no-gutters>
              <v-col>
                <v-row no-gutters>
                  <v-col class="ml-8 fontBolder">
                    <span>{{ getPhysicalAddressItem('addressLine1') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-8 fontBolder">
                    <span>{{ getPhysicalAddressItem('addressLine2') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-8 fontBolder">
                    <span>{{ getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode')  + ', ' + getPhysicalAddressItem('countryCode') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-8 fontBolder">
                    <span>{{ getPhysicalAddressItem('postal') }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row v-else no-gutters>
              <v-col>
                <v-row no-gutters>
                  <v-col class="ml-8 fontBolder fontItalic">
                    <span>Same as Mailing Address</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton';

export default {
  name: 'DistrictDetailsPage',
  mixins: [alertMixin],
  components: {PrimaryButton},
  props: {
    districtID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      district: null,
      loading: false
    };
  },
  created() {
    this.getDistrict();
  },
  methods: {
    getDistrict() {
      this.loading = true;

      ApiService.apiAxios.get(ApiRoutes.district.BASE_URL + '/' + this.districtID, {
      }).then(response => {
        this.district = response.data;
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.loading = false;
      });
    },
    getStatusColor() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'green';
      } else {
        return 'red';
      }
    },
    getStatusText() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'Active';
      } else {
        return 'Inactive';
      }
    },
    hasMailingAddress(){
      return this.district.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasSamePhysicalAddress(){
      return !this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddressItem(item){
      let mailingAddress = this.district.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if(x === item){
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item){
      let physicalAddress = this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if(x === item){
          return physicalAddress[0][item];
        }
      }
    },
  }
};
</script>

<style scoped>
.divider {
  border-color: #FCBA19;
  border-width: medium;
}

.fontBolder{
  font-weight: bolder;
}

.fontItalic{
  font-style: italic;
}

.containerSetup{
  padding-right: 50em !important;
  padding-left: 5em !important;
}

@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 20em !important;
    padding-left: 5em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 2em !important;
    padding-left: 2em !important;
  }
}

</style>
