<template>
  <v-card
    :id="`districtContactCard-${contact.districtContactId}`"
    class="d-flex flex-column"
    height="100%"
  >
    <v-card-title class="text-wrap pb-0">
      <v-row no-gutters>
        <v-col>
          <v-icon
            icon="mdi-circle"
            class="pb-1"
            size="x-small"
            :color="getStatusColor(contact)"
            start
          />
          <strong class="contactName">{{ formatContactName(contact) }}</strong>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-subtitle>
      <span
        v-if="contact.expiryDate"
        id="contactEffectiveAndExpiryDate"
        class="dateSubText"
      >
        {{ formatDate(contact.effectiveDate) }} - {{ formatDate(contact.expiryDate) }}
      </span>
      <span
        v-else
        id="contactEffectiveDate"
        class="dateSubText"
      >
        {{ formatDate(contact.effectiveDate) }}
      </span>
    </v-card-subtitle>
    <v-card-text class="pb-0">
      <v-list class="pt-0">
        <v-list-item
          v-if="!contact.email && !contact.phoneNumber && canEditDistrictContact"
          min-height="inherit"
          class="pl-0"
        >
          <a
            class="missing-highlight"
            @click="handleOpenEditor"
          >
            <v-icon
              icon="mdi-alert"
              size="x-large"
              color="#ff5252"
              start
            />
            <span>Add missing email or phone</span>
          </a>
        </v-list-item>
        <v-list-item
          v-if="contact.jobTitle"
          min-height="inherit"
          class="pl-0"
        >
          <v-row>
            <v-col cols="1">
              <v-icon
                icon="mdi-account"
              />
            </v-col>
            <v-col class="d-flex ml-1">
              <span id="contactJobTitle"> {{ contact.jobTitle }}</span>
            </v-col>
          </v-row>
        </v-list-item>
        <v-list-item
          v-if="contact.email"
          min-height="inherit"
          class="pl-0"
        >
          <v-row>
            <v-col cols="1">
              <v-icon
                icon="mdi-email"
                start
              />
            </v-col>
            <v-col class="d-flex ml-1">
              <span id="contactEmail"> {{ contact.email }}</span>
            </v-col>
          </v-row>
        </v-list-item>
        <v-list-item
          v-if="contact.phoneNumber"
          min-height="inherit"
          class="pl-0"
        >
          <v-row>
            <v-col cols="1">
              <v-icon
                icon="mdi-phone"
                start
              />
            </v-col>
            <v-col class="d-flex ml-1">
              <span id="contactPhoneNumber">{{ formatPhoneNumber(contact.phoneNumber) }}</span>
              <span v-if="contact.phoneExtension"> ext. {{ contact.phoneExtension }}</span>
            </v-col>
          </v-row>
        </v-list-item>
        <v-list-item
          v-if="contact.alternatePhoneNumber"
          min-height="inherit"
          class="pl-0"
        >
          <v-row>
            <v-col cols="1">
              <v-icon
                icon="mdi-phone"
                start
              />
            </v-col>
            <v-col class="d-flex ml-1">
              <span id="contactAlternatePhoneNumber">
                {{ formatPhoneNumber(contact.alternatePhoneNumber) }} (alt.)
              </span>
              <span v-if="contact.alternatePhoneExtension">
                ext. {{ contact.alternatePhoneExtension }}
              </span>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions class="justify-start">
      <v-btn id="editContactButton" color="#003366" variant="text" @click="handleOpenEditor">Edit</v-btn>
      <v-btn id="removeContactButton" color="red" variant="text" @click="callShowRemoveContactConfirmation">Remove</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import alertMixin from '../../mixins/alertMixin';
import { formatPhoneNumber, formatDate, formatContactName } from '../../utils/format';
import { getStatusColor } from '../../utils/institute/status';

export default {
  name: 'DistrictContact',
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: true
    },
    contact: {
      type: Object,
      required: true
    },
    canEditDistrictContact: {
      type: Boolean,
      required: true
    },
    handleOpenEditor: {
      type: Function,
      required: true
    }
  },
  emits: ['remove-district-contact:show-confirmation-prompt'],
  methods: {
    callShowRemoveContactConfirmation() {
      this.$emit('remove-district-contact:show-confirmation-prompt', this.contact.districtId, this.contact.districtContactId);
    },
    formatDate,
    formatPhoneNumber,
    getStatusColor,
    formatContactName
  }
};
</script>

<style scoped>
.dateSubText{
  font-style: italic;
  font-size: 0.95em;
}

.contactName{
  font-size: 0.85em;
}

.missing-highlight {
  color: #ff5252;
}
.missing-highlight span:hover { text-decoration: underline; }
</style>
