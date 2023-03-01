import {ALERT_NOTIFICATION_TYPES} from '../utils/constants/AlertNotificationTypes';
import { appStore } from '../store/modules/app';
import {mapActions} from 'pinia';

export default {
  data() {
    return {
      alertType: null,
    };
  },
  methods: {
    ...mapActions(appStore, ['addAlertNotification']),
    setSuccessAlert(message) {
      this.addAlertNotification({text: message, alertType: ALERT_NOTIFICATION_TYPES.SUCCESS});
    },
    setFailureAlert(message) {
      this.addAlertNotification({text: message, alertType: ALERT_NOTIFICATION_TYPES.ERROR});
    },
    setWarningAlert(message) {
      this.addAlertNotification({text: message, alertType: ALERT_NOTIFICATION_TYPES.WARN});
    }
  }
};
