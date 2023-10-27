<template>
  <v-card
    :id="`districtContactCard-${contact.districtContactId}`"
    class="districtContactCard"
    height="100%"
  >
    <v-card-title class="text-wrap pb-0">
      <v-row no-gutters>
        <v-col cols="10">
          <v-icon
            icon="mdi-circle"
            class="pb-1"
            size="x-small"
            :color="getStatusColor(contact)"
            start
          />
          <strong>{{ formatContactName(contact) }}</strong>
        </v-col>
        <v-col
          cols="2"
          class="d-flex justify-end"
        >
          <v-btn
            v-if="canEditDistrictContact"
            id="editContactButton"
            class="mr-2"
            title="Edit"
            width="0.5em"
            color="white"
            min-width="0.5em"
            variant="flat"
            @click="handleOpenEditor"
          >
            <v-icon
              icon="mdi-pencil"
              size="x-large"
              color="#003366"
              dark
            />
          </v-btn>
          <v-btn
            v-if="canEditDistrictContact"
            id="removeContactButton"
            title="Remove"
            color="white"
            width="0.5em"
            min-width="0.5em"
            depressed
            small
            variant="flat"
            @click="callShowRemoveContactConfirmation"
          >
            <v-icon
              size="x-large"
              color="#003366"
              dark
            >
              mdi-delete
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="pb-0">
      <v-list density="compact" class="pt-0">
        <v-list-item
          v-if="!contact.email && !contact.phoneNumber && canEditDistrictContact"
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
          class="pl-0"
        >
          <v-icon
            icon="mdi-account"
            start
          />
          <span id="contactEmail"> {{ contact.jobTitle }}</span>
        </v-list-item>
        <v-list-item
          v-if="contact.email"
          class="pl-0"
        >
          <v-icon
            icon="mdi-email"
            start
          />
          <span id="contactEmail"> {{ contact.email }}</span>
        </v-list-item>
        <v-list-item
          v-if="contact.phoneNumber"
          class="pl-0"
        >
          <v-icon
            icon="mdi-phone"
            start
          />
          <span id="contactPhoneNumber">{{ formatPhoneNumber(contact.phoneNumber) }}</span>
          <span v-if="contact.phoneExtension"> ext. {{ contact.phoneExtension }}</span>
        </v-list-item>
        <v-list-item
          v-if="contact.alternatePhoneNumber"
          class="pl-0"
        >
          <v-icon
            icon="mdi-phone"
            start
          />
          <span id="contactAlternatePhoneNumber">
            {{ formatPhoneNumber(contact.alternatePhoneNumber) }} (alt.)
          </span>
          <span v-if="contact.alternatePhoneExtension">
            ext. {{ contact.alternatePhoneExtension }}
          </span>
        </v-list-item>
        <v-list-item
          v-if="contact.expiryDate"
          class="pl-0 text-left"
        >
          <v-icon
            icon="mdi-calendar-today"
            size="small"
            aria-hidden="false"
            start
          />
          <span
            id="contactEffectiveAndExpiryDate"
            class="text-caption"
          >
            {{ formatDate(contact.effectiveDate) }} - {{ formatDate(contact.expiryDate) }}
          </span>
        </v-list-item>
        <v-list-item
          v-else
          class="pl-0 text-left"
        >
          <v-icon
            icon="mdi-calendar-today"
            size="small"
            aria-hidden="false"
            start
          />
          <span
            id="contactEffectiveDate"
            class="text-caption"
          >
            {{ formatDate(contact.effectiveDate) }}
          </span>
        </v-list-item>
      </v-list>
    </v-card-text>
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

.missing-highlight {
  color: #ff5252;
}
.missing-highlight span:hover { text-decoration: underline; }
.districtContactCard { position: relative; }
.districtContactCard .date-container {
  position: absolute;
  bottom: 1rem; left: 1rem;
}
</style>
