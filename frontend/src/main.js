import { createApp } from 'vue';
import { createVuetify } from 'vuetify/dist/vuetify';
import { createMetaManager } from 'vue-meta';
import { Viewer } from 'v-viewer';
import App from './App.vue';
import router from './router';
import 'regenerator-runtime/runtime';
import {createPinia} from 'pinia';
import moment from 'moment';

const vuetify = createVuetify();
const pinia = createPinia();

const newApp = createApp(App);

// newApp.use(Viewer);

newApp.provide('$moment', moment);
newApp.use(router).use(createMetaManager()).use(pinia).use(vuetify).mount('#app');
