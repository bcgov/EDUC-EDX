import Vuex from 'vuex';
import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { getField, updateField } from 'vuex-map-fields';
import RequestForm from '@/components/ump/RequestForm.vue';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Vuetify);

describe('Component initialized with namespaced Vuex module.', () => {
  let store;
  let wrapper;

  const actions = {
    postRequest: jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false)
  };

  let genderCodes = [
    {label:'Male', genderCode:'M'},
    {label:'Female', genderCode:'F'},
    {label:'Gender Diverse', genderCode:'X'},
    {label:'Unknown', genderCode:'U'},
  ];

  const recordedData = {
    pen: '123456',
    legalFirstName: 'Jimmy',
    legalMiddleNames: 'Wayne',
    legalLastName: 'Duke',
    genderCode: 'M',
    dob: '1989-06-04',
    email: 'james@test.com'
  };

  let student = {
    pen: '123456',
    legalFirstName: 'James',
    legalMiddleNames: 'Wayne',
    legalLastName: 'Duke',
    sexCode: 'M',
    sexLabel: 'Male',
    genderCode: 'M',
    dob: '1989-06-04'
  };

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        root: {
          getters: {
            student: jest.fn().mockReturnValue(student)
          }
        },
        studentRequest: {
          namespaced: true,
          actions,
          getters: {
            genders: jest.fn().mockReturnValue(genderCodes),
          },
        },
        ump: {
          namespaced: true,
          state: {
            isEditable: {
              editLegalLastName: false
            },
            recordedData,
            updateData: {
              legalLastName: null,
              legalFirstName: null,
              legalMiddleNames: null,
              dob: null,
              genderCode: null,
              email: null,
            }
          },
          getters: {
            getField,
          },
          mutations: {
            updateField,
          },
        },
      },
    });

    wrapper = shallowMount(RequestForm, { localVue, store });
  });

  test('It should render the component.', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
