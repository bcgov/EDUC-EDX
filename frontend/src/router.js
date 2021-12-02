import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';

import moment from 'moment';

import Home from '@/components/Home.vue';
import Logout from './components/Logout';
import SessionExpired from './components/SessionExpired';
import PenRequestPage from '@/components/gmp/RequestPage.vue';
import StudentRequestPage from '@/components/ump/RequestPage.vue';
import PenRequestVerification from '@/components/gmp/Verification.vue';
import StudentRequestVerification from '@/components/ump/Verification.vue';
import ErrorPage from '@/components/ErrorPage.vue';
import LoginError from '@/components/LoginError.vue';
import RouterView from '@/components/RouterView.vue';
import Ump from '@/components/ump/Ump.vue';
import Gmp from '@/components/gmp/Gmp.vue';
import CurrentInfo from './components/ump/CurrentInfo';
import StudentRequestForm from './components/ump/RequestForm';
import StudentRequestSummary from './components/ump/RequestSummary';
import StudentRequestSubmission from './components/ump/RequestSubmission';
import PenRequestForm from './components/gmp/RequestForm';
import PenRequestSummary from './components/gmp/RequestSummary';
import PenRequestSubmission from './components/gmp/RequestSubmission';
import authStore from './store/modules/auth';
import store from './store/index';
import {pick, values} from 'lodash';
import { PenRequestStatuses, StudentRequestStatuses } from '@/utils/constants';
import Login from '@/components/Login.vue';
import BackendSessionExpired from '@/components/BackendSessionExpired';

Vue.prototype.moment = moment;

Vue.use(VueRouter);
Vue.use(VueMeta);
// a comment for commit.
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true
      },

    },
    {
      path: '/ump',
      component: RouterView,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'ump',
          component: Ump,
          meta: {
            requiresAuth: true
          },
          beforeEnter: (to, from, next) => {
            store.commit('ump/clearUmpState');
            const hasInflightGMPRequest = store.getters['penRequest/request'] && values(pick(PenRequestStatuses, ['DRAFT', 'INITREV', 'RETURNED', 'SUBSREV'])).some(status => status === store.getters['penRequest/request'].penRequestStatusCode);
            if(authStore.state.isAuthenticated && !store.getters['studentRequest/request'] && !hasInflightGMPRequest) {
              store.commit('setRequestType','studentRequest');
              next('ump/request');
            } else {
              next();
            }
          },
        },
        {
          path: 'request',
          component: StudentRequestPage,
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: '',
              name: 'step1',
              component: CurrentInfo,
              beforeEnter: checkStudentRequestExists,
              meta: {
                requiresAuth: true
              },
            },
            {
              path: 'requestForm',
              name: 'step2',
              component: StudentRequestForm,
              beforeEnter: checkStudentRequestExists,
              meta: {
                requiresAuth: true
              },
            },
            {
              path: 'requestSummary',
              name: 'step3',
              component: StudentRequestSummary,
              beforeEnter: checkStudentRequestExists,
              meta: {
                requiresAuth: true
              },
            },
            {
              path: 'requestSubmission',
              name: 'step4',
              component: StudentRequestSubmission,
              meta: {
                requiresAuth: true
              },
            }
          ]
        },
        {
          path: 'verification/:status',
          name: 'student-request-verification',
          component: StudentRequestVerification
        },
      ]
    },
    {
      path: '/gmp',
      component: RouterView,

      children: [
        {
          path: '',
          name: 'gmp',
          component: Gmp,
          meta: {
            requiresAuth: true
          },
          beforeEnter: (to, from, next) => {
            store.commit('gmp/clearGmpState');
            const hasInflightOrCompletedUMPRequest = store.getters['studentRequest/request'] && values(pick(StudentRequestStatuses, ['DRAFT', 'INITREV', 'RETURNED', 'SUBSREV', 'COMPLETED'])).some(status => status === store.getters['studentRequest/request'].studentRequestStatusCode);
            if(authStore.state.isAuthenticated && !store.getters['penRequest/request'] && !hasInflightOrCompletedUMPRequest) {
              store.commit('setRequestType','penRequest');
              next('gmp/request');
            } else {
              next();
            }
          },
        },
        {
          path: 'request',
          component: PenRequestPage,
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: '',
              name: 'gmp-step1',
              component: PenRequestForm,
              beforeEnter: checkPenRequestExists,
              meta: {
                requiresAuth: true
              },
            },
            {
              path: 'requestSummary',
              name: 'gmp-step2',
              component: PenRequestSummary,
              beforeEnter: checkPenRequestExists,
              meta: {
                requiresAuth: true
              },
            },
            {
              path: 'requestSubmission',
              name: 'gmp-step3',
              component: PenRequestSubmission,
              meta: {
                requiresAuth: true
              },
            }
          ]
        },
        {
          path: 'verification/:status',
          name: 'pen-request-verification',
          component: PenRequestVerification,
          meta: {
            requiresAuth: true
          },
        },
      ]
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorPage
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    },
    {
      path: '/session-expired',
      name: 'session-expired',
      component: SessionExpired
    },
    {
      path: '/login-error',
      name: 'login-error',
      component: LoginError
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '*',
      name: 'notfound',
      redirect: '/',
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/token-expired',
      name: 'backend-session-expired',
      component: BackendSessionExpired
    }

  ]
});

function checkStudentRequestExists(to, from, next) {
  if(authStore.state.isAuthenticated && (!store.getters['studentRequest/request'] || ['COMPLETED', 'ABANDONED', 'REJECTED'].includes(store.getters['studentRequest/request'].studentRequestStatusCode))) {
    store.commit('setRequestType','studentRequest');
    next();
  } else {
    next('/ump');
  }
}

function checkPenRequestExists(to, from, next) {
  if(authStore.state.isAuthenticated && (!store.getters['penRequest/request'] || ['ABANDONED', 'REJECTED'].includes(store.getters['penRequest/request'].penRequestStatusCode))) {
    store.commit('setRequestType','penRequest');
    next();
  } else {
    next('/gmp');
  }
}

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && authStore.state.isAuthenticated) {
    store.dispatch('auth/getJwtToken').then(() => {
      if (!authStore.state.isAuthenticated) {
        next('/token-expired');
      } else {
        store.dispatch('auth/getUserInfo').then(() => {
          next();
        }).catch(() => {
          next('error');
        });
      }
    }).catch(() => {
      next('/token-expired');
    });
  }
  else{
    next();
  }
});
export default router;
