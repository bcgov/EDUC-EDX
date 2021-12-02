import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { createHelpers, getField, updateField } from 'vuex-map-fields';

const localVue = createLocalVue();

localVue.use(Vuex);

const { mapFields } = createHelpers({
  getterType: 'ump/getField',
  mutationType: 'ump/updateField',
});

describe('Component initialized with namespaced Vuex module.', () => {
  let store;
  let wrapper;
  let Component;

  const actions = {
    postRequest: jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false)
  };

  let genderCodes = [
    {label:'Male', genderCode:'M'},
    {label:'Female', genderCode:'F'},
    {label:'Gender Diverse', genderCode:'X'},
    {label:'Unknown', genderCode:'U'},
  ];

  beforeEach(() => {
    Component = {
      template: '<input id="editLegalLastName" v-model="editLegalLastName">',
      computed: {
        ...mapFields([
          'isEditable.editLegalLastName',
        ]),
      },
    };

    store = new Vuex.Store({
      modules: {

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

    wrapper = shallowMount(Component, { localVue, store });
  });

  test('It should render the component.', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('It should update field values when the store is updated.', () => {
    store.state.ump.isEditable.editLegalLastName = true;

    expect(wrapper.element.value).toBe('true');
  });

  test('It should update the store when the field values are updated.', () => {
    wrapper.element.value = true;
    wrapper.trigger('input');

    expect(store.state.ump.isEditable.editLegalLastName).toBe('true');
  });
});
