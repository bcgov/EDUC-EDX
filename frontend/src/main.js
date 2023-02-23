import { createApp } from 'vue';
import { createVuetify } from 'vuetify/dist/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';
import 'regenerator-runtime/runtime';
import {createPinia} from 'pinia';

const vuetify = createVuetify();
const pinia = createPinia()

createApp(App).use(router).use(store).use(pinia).use(vuetify).mount('#app');
