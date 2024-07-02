import {defineStore} from 'pinia';

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
      }catch (e) {
        console.error(e);
      }
    }
  }
});
