import {createRouter, createWebHistory} from 'vue-router';
import Home from './components/Home.vue';
import Logout from './components/Logout.vue';
import UserActivationLinkError from './components/UserActivationLinkError.vue';
import SessionExpired from './components/SessionExpired.vue';
import ErrorPage from './components/ErrorPage.vue';
import LoginError from './components/LoginError.vue';
import Unauthorized from './components/common/Unauthorized.vue';
import UnauthorizedNoEDXUser from './components/common/UnauthorizedNoEDXUser.vue';
import {authStore} from './store/modules/auth';
import {appStore} from './store/modules/app';
import Login from './components/Login.vue';
import LoginIDIR from './components/LoginIDIR.vue';
import BackendSessionExpired from './components/BackendSessionExpired.vue';
import {PAGE_TITLES} from './utils/constants';
import MessageDisplay from './components/SecureExchange/MessageDisplay.vue';
import ExchangePage from './components/SecureExchange/ExchangeInbox.vue';
import NewMessagePage from './components/SecureExchange/NewMessagePage.vue';
import RouterView from './components/RouterView.vue';
import AccessSchoolUsersPage from './components/admin/SchoolUsersAccessPage.vue';
import InstituteSelection from './components/InstituteSelection.vue';
import ActivateEdxUserAccount from './components/common/ActivateEdxUserAccount.vue';
import SchoolListPage from './components/school/SchoolList.vue';
import SchoolDetailsPage from './components/school/SchoolDetails.vue';
import AccessDistrictUsersPage from './components/admin/DistrictUsersAccessPage.vue';
import ViewAllDistrictSchoolUsersPage from './components/admin/ViewAllDistrictSchoolUsersPage.vue';
import DistrictDetails from './components/district/DistrictDetails.vue';
import SDCCollectionSummary from './components/sdcCollection/SDCCollectionSummary.vue';
import SDCCollectionView from './components/sdcCollection/sdcSchoolCollection/SDCCollectionView.vue';
import InviteSelection from './components/InviteSelection.vue';
import AccessSchoolUsersDetailsPage from './components/admin/SchoolUsersAccessDetailsPage.vue';
import ApiService from './common/apiService';
import SDCDistrictCollectionView from './components/sdcCollection/sdcDistrictCollection/SDCDistrictCollectionView.vue';
import {PERMISSION} from './utils/constants/Permission';
import GraduationSchoolTabs from './components/graduation/school/GraduationSchoolTabs.vue';
import AssessmentSessionDetail from './components/assessments/AssessmentSessionDetail.vue';
import GradReportsAndTranscripts from './components/graduation/school/reports/GradSchoolReportsAndTranscripts.vue';
import GradErrorsView from './components/graduation/school/upload/GradErrorsView.vue';
import GradDistrictReportsAndTranscripts from './components/graduation/district/reports/GradDistrictReportsAndTranscripts.vue';
import GradSchoolStudentSearch from './components/graduation/school/students/GradSchoolStudentSearch.vue';
import GradSchoolCurrentStudents from './components/graduation/school/students/GradSchoolCurrentStudents.vue';
import GraduationDistrictTabs from './components/graduation/district/GraduationDistrictTabs.vue';
import ChallengeReports from './components/challengeReports/ChallengeReports.vue';
import DoarSummary from './components/assessments/static/DoarSummary.vue';

const excludeInstituteNameFromPageTitleList=[PAGE_TITLES.SELECTION, PAGE_TITLES.ACTIVATE_USER];
const router = createRouter({
  history: createWebHistory(),
  base: import.meta.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        pageTitle: PAGE_TITLES.DASHBOARD,
        requiresAuth: true
      },

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
      path: '/unauthorized',
      name: 'unauthorized',
      component: Unauthorized,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/unauthorizedNoEDXUser',
      name: 'unauthorizedNoEDXUser',
      component: UnauthorizedNoEDXUser,
      meta: {
        requiresAuth: false
      }
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
      path: '/institute-selection',
      name: 'institute-selection',
      component: InstituteSelection,
      meta: {
        pageTitle: PAGE_TITLES.SELECTION,
        requiresAuth: true
      }
    },
    {
      path: '/activation-error',
      name: 'activation-error',
      component: UserActivationLinkError
    },
    {
      path: '/doar-summary',
      name: 'doar-summary',
      component: DoarSummary,
      meta: {
        pageTitle: PAGE_TITLES.ASSESSMENT,
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        pageTitle: PAGE_TITLES.LOGIN,
        requiresAuth: false
      }
    },
    {
      path: '/loginIDIR',
      name: 'loginIDIR',
      component: LoginIDIR,
      meta: {
        pageTitle: PAGE_TITLES.STAFF_LOGIN,
        requiresAuth: false
      }
    },
    {
      path: '/invite-selection',
      name: 'invite-selection',
      component: InviteSelection,
      meta: {
        pageTitle: PAGE_TITLES.LOGIN,
        requiresAuth: false
      }
    },
    {
      path: '/user-activation',
      name: 'User Activation',
      component: ActivateEdxUserAccount,
      props: {
        instituteTypeLabel: 'School',
        instituteTypeCode: 'SCHOOL',
        instituteIdentifierLabel: 'Mincode'
      },
      meta: {
        pageTitle: PAGE_TITLES.ACTIVATE_USER,
        requiresAuth: true
      },
    },
    {
      path: '/district-user-activation',
      name: 'District User Activation',
      component: ActivateEdxUserAccount,
      props: {
        instituteTypeLabel: 'District',
        instituteTypeCode: 'DISTRICT',
        instituteIdentifierLabel: 'Number'
      },
      meta: {
        pageTitle: PAGE_TITLES.ACTIVATE_USER,
        requiresAuth: true
      },
    },
    {
      path: '/schoolAccess',
      name: 'schoolAccess',
      component: AccessSchoolUsersPage,
      meta: {
        pageTitle: PAGE_TITLES.SCHOOL_EXCHANGE_USERS,
        requiresAuth: true,
        permission: 'EDX_USER_SCHOOL_ADMIN'
      }
    },
    {
      path: '/schoolAccessDetail/:schoolID',
      name: 'schoolAccessDetail',
      props: true,
      component: AccessSchoolUsersDetailsPage,
      meta: {
        pageTitle: PAGE_TITLES.SCHOOL_EXCHANGE_USERS,
        requiresAuth: true,
        permission: 'EDX_USER_SCHOOL_ADMIN'
      }
    },
    {
      path: '/districtAccess',
      name: 'districtAccess',
      component: AccessDistrictUsersPage,
      meta: {
        pageTitle: PAGE_TITLES.DISTRICT_EXCHANGE_USERS,
        requiresAuth: true,
        permission: 'EDX_USER_DISTRICT_ADMIN'
      }
    },
    {
      path: '/districtSchools',
      name: 'districtSchools',
      component: ViewAllDistrictSchoolUsersPage,
      meta: {
        pageTitle: PAGE_TITLES.ALL_DISTRICT_SCHOOL_USERS,
        requiresAuth: true,
        permission: 'EDX_USER_DISTRICT_ADMIN'
      }
    },
    {
      path: '/:catchAll(.*)',
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
    },
    {
      path: '/',
      component: RouterView,
      children: [
        {
          path: 'inbox',
          name: 'inbox',
          component: ExchangePage,
          meta: {
            pageTitle: PAGE_TITLES.EXCHANGE,
            requiresAuth: true,
            permission: 'SECURE_EXCHANGE'
          }
        },
        {
          path: 'exchange/:secureExchangeID',
          name: 'viewExchange',
          component: MessageDisplay,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.VIEW_EXCHANGE,
            requiresAuth: true,
            permission: 'SECURE_EXCHANGE'
          }
        },
        {
          path: 'newExchange',
          name: 'newExchange',
          component: NewMessagePage,
          meta: {
            pageTitle: PAGE_TITLES.NEW_EXCHANGE,
            requiresAuth: true,
            permission: 'SECURE_EXCHANGE'
          }
        },
        {
          path: 'schools',
          name: 'schools',
          component: SchoolListPage,
          meta: {
            pageTitle: PAGE_TITLES.SCHOOLS,
            requiresAuth: true,
            mustBeDistrict: true
          }
        },
        {
          path: 'districtDetails/:districtID/:activeTab',
          name: 'districtDetails',
          props: true,
          component: DistrictDetails,
          meta: {
            pageTitle: PAGE_TITLES.DISTRICT_DETAILS,
            requiresAuth: true
          }
        },
        {
          path: 'school/:schoolID/details',
          name: 'schoolDetails',
          component: SchoolDetailsPage,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.SCHOOL_DETAILS,
            requiresAuth: true,
          }
        },
        {
          path: 'open-school-collection-summary/:schoolID',
          name: 'sdcCollectionSummary',
          component: SDCCollectionSummary,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.SDC,
            requiresAuth: true,
            permission: PERMISSION.SCHOOL_SDC_VIEW
          },
        },
        {
          path: 'open-collection-details/:schoolCollectionID',
          name: 'sdcCollection',
          component: SDCCollectionView,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.SDC,
            requiresAuth: true,
            permission: PERMISSION.SCHOOL_SDC_VIEW
          },
        },
        {
          path: 'open-district-collection-summary/:districtID',
          name: 'sdcDistrictCollectionSummary',
          component: SDCCollectionSummary,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.SDC,
            requiresAuth: true,
            permission: PERMISSION.DISTRICT_SDC_VIEW
          },
        },
        {
          path: 'open-district-collection-details/:sdcDistrictCollectionID',
          name: 'sdcDistrictCollection',
          component: SDCDistrictCollectionView,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.SDC,
            requiresAuth: true,
            permission: PERMISSION.DISTRICT_SDC_VIEW
          },
        },
        {
          path: 'graduation/school/:schoolID',
          name: 'graduationSchoolTabs',
          component: GraduationSchoolTabs,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.GRADUATION,
            requiresAuth: true
          },
        },
        {
          path: 'graduation/district/:districtID',
          name: 'graduationDistrictTabs',
          component: GraduationDistrictTabs,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.GRADUATION,
            requiresAuth: true
          },
        },
        {
          path: 'graduation/district/:districtID/reports',
          name: 'grad-district-reports',
          component: GradDistrictReportsAndTranscripts,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.GRAD_TRANSCRIPT_PREVIEW,
            requiresAuth: true,
            permission: PERMISSION.GRAD_DIS_RPT_VIEW
          },
        },
        {
          path: 'graduation/:instituteIdentifierID/errorReport/:activeIncomingFilesetID',
          name: 'grad-gdc-error-report',
          component: GradErrorsView,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.GRAD_UPLOAD_ERRORS,
            requiresAuth: true,
            permission: PERMISSION.GRAD_ERR_RPT_VIEW
          },
        },
        {
          path: '/assessment-sessions/district/details',
          name: 'district-assessment-session-detail',
          component: AssessmentSessionDetail,
          props:  true,
          meta: {
            pageTitle: PAGE_TITLES.ASSESSMENT,
            requiresAuth: true,
            permission: PERMISSION.EAS_DIS_EDIT
          },
        },
        {
          path: '/assessment-sessions/school/details',
          name: 'school-assessment-session-detail',
          component: AssessmentSessionDetail,
          props:  true,
          meta: {
            pageTitle: PAGE_TITLES.ASSESSMENT,
            requiresAuth: true,
            permission: PERMISSION.EAS_SCH_EDIT
          },
        },
        {
          path: 'graduation/:schoolID/search',
          name: 'grad-student-search',
          component: GradSchoolStudentSearch,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.GRAD_SCHOOL_STUDENT_SEARCH,
            requiresAuth: true,
            permission: PERMISSION.GRAD_SCH_RPT_VIEW
          },
        },
        {
          path: 'graduation/:schoolID/current-students',
          name: 'grad-current-students',
          component: GradSchoolCurrentStudents,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.GRAD_SCHOOL_CURRENT_STUDENTS,
            requiresAuth: true,
            permission: PERMISSION.GRAD_SCH_RPT_VIEW
          },
        },
        {
          path: 'graduation/:schoolID/reports',
          name: 'grad-school-reports',
          component: GradReportsAndTranscripts,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.GRAD_REPORTS,
            requiresAuth: true,
            permission: PERMISSION.GRAD_SCH_RPT_VIEW
          },
        },
        {
          path: 'challenge-reports/:districtID',
          name: 'challengeReports',
          component: ChallengeReports,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.CHALLENGE_REPORTS,
            requiresAuth: true,
            permission: PERMISSION.GRAD_DIS_RPT_VIEW
          }
        }
      ]
    },

  ]
});

router.beforeEach((to, _from, next) => {
  const aStore = authStore();
  const apStore = appStore();
  // this section is to set page title in vue store
  if (to.meta.requiresAuth) {
    aStore.getJwtToken().then(() => {
      if (!aStore.isAuthenticated) {
        next('/token-expired');
      } else {
        aStore.getUserInfo().then(async () => {
          let schoolBelongsToDistrict = false;
          if (aStore.userInfo.activeInstituteType === 'DISTRICT' && to?.params?.schoolID) {
            await ApiService.getSchoolBelongsToDistrict(to.params.schoolID).then((result) => {
              schoolBelongsToDistrict = result.data;
            });
          }
          if ((aStore.userInfo?.userSchoolIDs?.length > 0 || aStore.userInfo?.userDistrictIDs?.length > 0) && (!Object.prototype.hasOwnProperty.call(aStore.userInfo, 'activeInstitutePermissions'))) {
            if (to.fullPath === '/institute-selection') {
              next();
            } else {
              next('/institute-selection');
            }
          } else if (to?.meta?.permission && (!Object.prototype.hasOwnProperty.call(aStore.userInfo, 'activeInstitutePermissions') || aStore.userInfo.activeInstitutePermissions.filter(perm => perm === to.meta.permission).length < 1)) {
            next('/unauthorized');
          } else if (to?.params?.districtID && to.params.districtID !== aStore.userInfo.activeInstituteIdentifier) {
            next('/unauthorized');
          } else if (to?.params?.schoolID && to.params.schoolID !== aStore.userInfo.activeInstituteIdentifier && schoolBelongsToDistrict === false) {
            next('/unauthorized');
          } else if (to?.meta?.mustBeDistrict && aStore.userInfo.activeInstituteType !== 'DISTRICT') {
            next('/unauthorized');
          } else if (to?.meta) {
            if (aStore.userInfo.activeInstituteTitle && !excludeInstituteNameFromPageTitleList.includes(to.meta.pageTitle)) {
              apStore.setPageTitle(to.meta.pageTitle + ' | ' + aStore.userInfo.activeInstituteTitle + ' (' + aStore.userInfo.activeInstituteCode + ')');
            } else {
              apStore.setPageTitle(to.meta.pageTitle);
            }
            next();
          }
        }).catch(() => {
          next('error');
        });
      }
    }).catch(() => {
      if (!aStore.userInfo) {
        next('/login');
      }else{
        next('/token-expired');
      }
    });
  }
  else{
    if (!aStore.userInfo) {
      next();
    }
    if (to?.meta) {
      apStore.setPageTitle(to.meta.pageTitle);
    } else {
      apStore.setPageTitle('');
    }
    next();
  }
});
export default router;
