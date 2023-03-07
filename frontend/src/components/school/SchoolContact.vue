<template>
  <span>
    <v-card
      :id="`schoolContactCard-${contact.schoolContactId}`"
      class="schoolContactCard pb-8"
      height="100%">
      <v-card-title class="text-wrap">
        <v-row no-gutters>
          <v-col cols="10">
            <v-icon
              icon="mdi-circle"
              class="pb-1"
              size="x-small"
              :color="getStatusColor(contact)"
              start />
              <strong>{{ formatContactName(contact) }}</strong>
          </v-col>
          <v-col cols="2" class="d-flex justify-end">
            <v-btn
              id="editContactButton"
              title="Edit"
              width="0.5em"
              v-if="canEditSchoolContact"
              @click="handleOpenEditor"
              color="white"
              min-width="0.5em">
              <v-icon icon="mdi-pencil" size="x-large" color="#003366" dark />
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="pb-0">
        <v-list density="compact">
          <v-list-item v-if="!contact.email && !contact.phoneNumber" class="pl-0">
            <a class="missing-highlight" @click="handleOpenEditor">
              <v-icon icon="mdi-alert" size="x-large" color="#ff5252" start />
              <span>Add missing email or phone</span>
            </a>
          </v-list-item>
          <v-list-item v-if="contact.email" class="pl-0">
            <v-icon icon="mdi-email" start />
            <span id="contactEmail"> {{ contact.email }}</span>
          </v-list-item>
          <v-list-item v-if="contact.phoneNumber" class="pl-0">
            <v-icon icon="mdi-phone" start />
            <span id="contactPhoneNumber">{{ formatPhoneNumber(contact.phoneNumber) }}</span>
            <span v-if="contact.phoneExtension"> ext. {{ contact.phoneExtension }}</span>
          </v-list-item>
          <v-list-item class="pl-0" v-if="contact.alternatePhoneNumber">
            <v-icon icon="mdi-phone" start />
            <span id="contactAlternatePhoneNumber">
              {{ formatPhoneNumber(contact.alternatePhoneNumber) }} (alt.)
            </span>
            <span v-if="contact.alternatePhoneExtension">
              ext. {{ contact.alternatePhoneExtension }}
            </span>
          </v-list-item>
        </v-list>
        <div class="date-container">
          <div class="pl-0 text-right" v-if="contact.expiryDate">
            <v-icon icon="mdi-calendar-today" size="small" aria-hidden="false" start />
            <span id="contactEffectiveAndExpiryDate" class="text-caption">
              {{ formatDate(contact.effectiveDate) }} - {{ formatDate(contact.expiryDate) }}
            </span>
          </div>
          <div class="pl-0 text-right" v-else>
            <v-icon icon="mdi-calendar-today" size="small" aria-hidden="false" start />
            <span id="contactEffectiveDate" class="text-caption">
             {{ formatDate(contact.effectiveDate) }}
            </span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </span>
</template>

<script>
import { formatPhoneNumber, formatDate, formatContactName } from '../../utils/format';
import { getStatusColor } from '../../utils/institute/status';

export default {
  name: 'SchoolContact',
  props: {
    schoolID: {
      type: String,
      required: true
    },
    contact: {
      type: Object,
      required: true
    },
    canEditSchoolContact: {
      type: Boolean,
      required: true
    },
    handleOpenEditor: {
      type: Function,
      required: true
    }
  },
  methods: {
    formatDate,
    formatPhoneNumber,
    getStatusColor,
    formatContactName
  }
};
</script>

<style scoped>
.editField {
  font-size: 16px;
  color: rgb(0, 51, 102);
  vertical-align: super;
}

.editField:hover {
  text-decoration: underline;
}

.missing-highlight {
  color: #ff5252;
}
.missing-highlight span:hover { text-decoration: underline; }
.schoolContactCard { position: relative; }
.schoolContactCard .date-container {
  position: absolute;
  bottom: 1rem; right: 1rem;
}
</style>
