import {defineStore} from 'pinia';
import {appStore} from './app';

export const wsNotifications = defineStore('wsNotifications', {
  id: 'wsNotifications',
  state: () => ({
    notification: null,
    notifications:[]
  }),
  actions: {
    async changeNotification(payload){
      this.notification = payload;
      this.notifications.push(payload);
    },
    async setNotification(payload){
      try{
        const notificationData = JSON.parse(payload);
        await this.changeNotification(notificationData);
        if(notificationData &&
            ((notificationData.eventType === 'COPY_USERS_TO_NEW_SCHOOL' && notificationData.eventOutcome === 'USERS_TO_NEW_SCHOOL_COPIED')
                || (notificationData.eventType === 'UPDATE_GRAD_SCHOOL' && notificationData.eventOutcome === 'GRAD_SCHOOL_UPDATED'))){
          await appStore().refreshEntities();
        }
      }catch (e) {
        console.error(e);
      }
    }
  }
});
