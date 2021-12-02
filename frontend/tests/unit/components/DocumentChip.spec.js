import { mount, createLocalVue } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import Vue from 'vue';
import DocumentChip from '@/components/DocumentChip.vue';
import { ApiRoutes } from '@/utils/constants';
import VueRouter from 'vue-router';

describe('DocumentChip.vue', () => {
  let wrapper;

  const localVue = createLocalVue();

  Vue.use(VueRouter);
  Vue.use(Vuetify);
  localVue.use(Vuex);

  //addElemWithDataAppToBody();

  const router = new VueRouter();
  const vuetify = new Vuetify();

  const deleteFileSpy = jest.fn();
  const requestType = 'studentRequest';
  const store = mockStore(requestType, deleteFileSpy);

  const document = {
    fileSize: 1048576,
    createDate: '2020-03-01T13:23:34',
    documentID: 'documentID',
    fileName: 'test.jpg',
    documentTypeCode: 'CAPASSPORT'
  };

  beforeEach(() => {
    wrapper = mount(DocumentChip, {
      localVue,
      vuetify,
      store,
      router,
      propsData: {
        document
      },
      attachToDocument: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  test('display file name', () => {
    const chip = wrapper.find('.v-chip');
    expect(chip.html()).toContain(document.fileName);
    expect(chip.html()).not.toContain('Canadian Passport');
  });

  test('display document info menu if clicked', async () => {
    const chip = wrapper.find('.v-chip');
    expect(chip.html()).not.toContain('disabled');
    chip.trigger('click');

    await localVue.nextTick();
    const listHtml = wrapper.find('.v-list').html();
    expect(listHtml).toContain('Canadian Passport');
    expect(listHtml).toContain(document.fileName);
    expect(listHtml).toContain(`${ApiRoutes[requestType].REQUEST}/requestID/documents/${document.documentID}/download/${document.fileName}`);
    expect(listHtml).toContain('2020-03-01, 13:23:34');
    expect(listHtml).toContain('1 MB');
    expect(wrapper.find('.v-card').html()).toContain('Delete');
  });

  test('not display document info menu if disabled', async () => {
    wrapper.setProps({ disabled: true });

    const chip = wrapper.find('.v-chip');
    expect(chip.html()).toContain('black');
  });

  test('not have delete button if undeletable', async () => {
    wrapper.setProps({ undeletable: true });

    const chip = wrapper.find('.v-chip');
    chip.trigger('click');

    await localVue.nextTick();
    expect(wrapper.find('.v-card').html()).not.toContain('Delete');
  });

  test('alert success if delete succesful', async () => {
    deleteFileSpy.mockResolvedValue({});
    const chip = wrapper.find('.v-chip');
    chip.trigger('click');

    await localVue.nextTick();
    const button = wrapper.find('#delete-document');
    button.trigger('click');

    await localVue.nextTick();
    expect(wrapper.vm.alert).toBeTruthy();
    expect(wrapper.find('.v-alert').html()).toContain('successfully');
  });

  test('alert error if delete failed', async () => {
    deleteFileSpy.mockRejectedValue(new Error('test error'));
    const chip = wrapper.find('.v-chip');
    chip.trigger('click');

    await localVue.nextTick();
    const button = wrapper.find('#delete-document');
    button.trigger('click');

    await localVue.nextTick();
    await localVue.nextTick();
    expect(wrapper.vm.alert).toBeTruthy();
    expect(wrapper.find('.v-alert').html()).toContain('unexpected error');
  });
});


function mockStore(requestType, deleteFile) {
  const documentTypeCodes = [
    {label:'Canadian Birth Certificate', documentTypeCode:'CABIRTH', displayOrder:'3'},
    {label:'Canadian Passport', documentTypeCode:'CAPASSPORT', displayOrder:'1'},
    {label:'Canadian Driver’s License', documentTypeCode:'CADL', displayOrder:'2'},
  ];

  const rootStore = {
    getters: {
      requestType: jest.fn().mockReturnValue(requestType)
    }
  };

  const documentStore = {
    actions: {
      deleteFile
    },
    getters: {
      documentTypeCodes: jest.fn().mockReturnValue(documentTypeCodes)
    },
  };

  const requestStore = {
    namespaced: true,
    getters: {
      requestID: jest.fn().mockReturnValue('requestID')
    },
    modules: {
      document: documentStore
    }
  };

  let store = new Vuex.Store({
    modules: {
      root: rootStore,
      [requestType]: requestStore
    }
  });

  return store;
}
