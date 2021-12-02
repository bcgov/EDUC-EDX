<template>
  <v-menu
    v-model="menu"
    bottom
    right
    transition="scale-transition"
    origin="top left"
  >
    <template v-slot:activator="{ on }">
      <v-chip
        class="chip-overflow ma-1 px-2 align-self-center"
        close
        :close-icon="disabled ? '' : 'fa-chevron-down' "
        :color="disabled ? 'black' : '#0C7CBA' "
        :disabled="disabled"
        label
        outlined
        v-on="on"
        @click:close="menu = true"
      >
        {{ document.fileName }}
      </v-chip>
    </template>

    <v-card width="380px" class="pa-1 pa-sm-2">
      <v-list>
        <v-list-item class="pa-0 pa-sm-0">
          <v-list-item-avatar>
            <v-icon>fa-id-card</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ documentType }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item class="px-0 pa-sm-0">
          <v-list-item-avatar>
            <v-icon>fa-file</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              <router-link :to="{ path: documentUrl }" target="_blank">{{ document.fileName }}</router-link>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item class="px-0 pa-sm-0">
          <v-list-item-avatar>
            <v-icon>fa-hdd</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ fileSize }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item class="px-0 pa-sm-0">
          <v-list-item-avatar>
            <v-icon>fa-clock</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ humanCreateDate }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-alert dense outlined dismissible v-model="alert" :class="alertType" class="mx-3 my-1">
        {{ alertMessage }}
      </v-alert>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="#003366" @click.stop="deleteDocument()" class="white--text" id="delete-document"
               :loading="deleting" v-if="!undeletable">Delete
        </v-btn>
        <v-btn id="documentUploadCancel" color="#003366" @click="menu = false" class="white--text">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import {humanFileSize} from '@/utils/file';
import {mapGetters} from 'vuex';
import {ApiRoutes} from '@/utils/constants';
import {find} from 'lodash';

export default {
  props: {
    document: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    undeletable: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      deleting: false,
      menu: false,

      alert: false,
      alertMessage: null,
      alertType: null
    };
  },
  computed: {
    ...mapGetters(['requestType']),
    documentTypeCodes() {
      return this.$store.getters[`${this.requestType}/documentTypeCodes`];
    },
    requestID() {
      return this.$store.getters[`${this.requestType}/requestID`];
    },
    documentType() {
      const typeCode = find(this.documentTypeCodes, ['documentTypeCode', this.document.documentTypeCode]);
      return typeCode && typeCode.label;
    },
    fileSize() {
      return humanFileSize(this.document.fileSize);
    },
    humanCreateDate() {
      return this.document.createDate.replace(/T/, ', ').replace(/\..+/, '');
    },
    documentUrl() {
      return `${ApiRoutes[this.requestType].REQUEST}/${this.requestID}/documents/${this.document.documentID}/download/${this.document.fileName}`;
    },
  },
  methods: {
    deleteFile(documentData) {
      return this.$store.dispatch(`${this.requestType}/deleteFile`, documentData);
    },
    setSuccessAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-success';
      this.alert = true;
    },
    setErrorAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    deleteDocument() {
      this.deleting = true;
      this.deleteFile({
        requestID: this.requestID,
        documentID: this.document.documentID
      }).then(() => {
        this.setSuccessAlert('Your document has been deleted successfully.');
      }).catch(() => {
        this.setErrorAlert('Sorry, an unexpected error seems to have occured. You can click on the delete button again later.');
      }).finally(() => {
        this.deleting = false;
      });
    },
  },
};
</script>

<style scoped>

.chip-overflow /deep/ .v-chip__content {
  line-height: 28px;
  display: inline-block !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 38px !important;
  position: relative;
}

.chip-overflow /deep/ .v-chip__close {
  border-left: 1px solid #0C7CBA;
  position: absolute;
  top: 5px;
  right: 8px;
  width: 24px;
  padding-left: 7px !important;
  max-width: 24px;
}

.v-list-item {
  min-height: 0;
}

.v-list-item__content {
  padding: 8px 0;
}

.v-avatar {
  margin: 4px 16px 4px 0 !important;
  height: 36px !important;
  min-width: 36px !important;
  width: 36px !important;
}

@media screen and (max-width: 320px) {
  .v-list-item /deep/ .v-list-item__title {
    font-size: 0.85rem;
  }

  .v-avatar {
    margin-right: 0 !important;
  }

  .v-icon {
    padding-left: 0 !important;
    font-size: 1.2rem;
  }
}

@media screen and (min-width: 321px) and (max-width: 410px) {
  .v-list-item /deep/ .v-list-item__title {
    font-size: 0.9rem;
  }

  .v-avatar {
    margin-right: 12px !important;
  }

  .v-icon {
    padding-left: 10px !important;
  }
}

</style>
