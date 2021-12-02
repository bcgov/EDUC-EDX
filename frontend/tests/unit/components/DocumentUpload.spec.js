import { mount, createLocalVue } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import Vue from 'vue';
import DocumentUpload from '@/components/DocumentUpload.vue';
import auth from '@/store/modules/auth.js';
import ApiService from '@/common/apiService';

describe('DocumentUpload.vue', () => {
  let wrapper;

  const localVue = createLocalVue();

  Vue.use(Vuetify);
  localVue.use(Vuex);

  //addElemWithDataAppToBody();

  const vuetify = new Vuetify();

  const setUploadedDocumentSpy = jest.fn();
  const requestType = 'studentRequest';
  const store = mockStore(requestType, setUploadedDocumentSpy);

  jest.spyOn(ApiService, 'getFileRequirements');
  const uploadFileSpy = jest.spyOn(ApiService, 'uploadFile');
  
  class FileReaderMock {
    readAsBinaryString() {
      this.onload({target: {result: 'file data'}});
    }
  }

  const oneMBFile = new File([new ArrayBuffer(1048576)], 'test.jpg' , {
    type: 'image/jpeg',
  });
  const twoMBFile = new File([new ArrayBuffer(2097152)], 'test.pdf', {
    type: 'application/pdf',
  });
  const otherFile = new File([new ArrayBuffer(1048576)], 'test.bmp', {
    type: 'image/bmp',
  });

  const fileRequirements = {
    maxSize: 1048579, 
    extensions: ['image/png', 'image/jpeg', '.pdf']
  };

  beforeEach(() => {
    ApiService.getFileRequirements.mockResolvedValue({data: fileRequirements});
    global.FileReader = FileReaderMock;
    wrapper = mount(DocumentUpload, {
      localVue,
      vuetify,
      store,
      propsData: {
        eager: true,
      },
      sync: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('expect document upload ready', () => {
    expect(wrapper.html()).toContain('Document Type');
    expect(wrapper.html()).toContain('Select your file');
    expect(wrapper.html()).toContain('PNG and JPEG files supported');
    expect(wrapper.vm.documentTypes).toContainEqual({text:'Canadian Passport', value:'CAPASSPORT'});
    expect(wrapper.vm.fileAccept).toContain('image/jpeg');
    expect(wrapper.vm.fileRules).toHaveLength(2);
    expect(wrapper.vm.dataReady).toBeFalsy();
  });

  test('can select document type', () => {
    const select = wrapper.find({name: 'v-select'});
    // expect(select.html()).toContain('Canadian Passport');

    // let item = {text:'Canadian Birth Certificate', value:'CABIRTH'};
    // select.vm.selectItem(item);
    select.findAll('.v-list-item').at(1).trigger('click');
    expect(wrapper.vm.documentTypeCode).toBe('CADL');
  });

  test('can select file', () => {    
    const input = wrapper.find({name: 'v-file-input'});
    // input.setProps({
    //   value: oneMBFile,
    // });
    //const inputElement = wrapper.find('input[type="file"]');

    input.vm.internalValue = oneMBFile;
    // await wrapper.vm.$nextTick();

    input.vm.validate();
    // expect(input.vm.hasError).toBeFalsy();
    expect(wrapper.vm.fileInputError.length).toBe(0);
    expect(wrapper.vm.file.name).toBe('test.jpg');
  });


  test('alert error if file too large', async () => {    
    const input = wrapper.find({name: 'v-file-input'});
    input.vm.internalValue = twoMBFile;

    input.vm.validate();
    expect(input.vm.hasError).toBeTruthy();
    expect(wrapper.vm.validForm).toBeFalsy();
    expect(wrapper.vm.dataReady).toBeFalsy();

    await localVue.nextTick();
    expect(input.html()).toContain('File size should not be larger than 1 MB');
  });

  test('alert error if file type not supported', async () => {    
    const input = wrapper.find({name: 'v-file-input'});
    input.vm.internalValue = otherFile;

    input.vm.validate();
    expect(input.vm.hasError).toBeTruthy();
    expect(wrapper.vm.validForm).toBeFalsy();
    expect(wrapper.vm.dataReady).toBeFalsy();

    await localVue.nextTick();
    expect(input.html()).toContain('File formats should be PNG and JPEG.');
  });

  test('alert error if no file slected', () => {    
    const input = wrapper.find({name: 'v-file-input'});
    input.vm.internalValue = null;

    input.vm.validate();
    expect(wrapper.vm.fileInputError).toContain('Required');
    expect(wrapper.vm.dataReady).toBeFalsy();
  });

  test('alert success if upload succesful', async () => {
    // const submitRequestStub = jest.fn();
    // wrapper.setMethods({ uploadFile: submitRequestStub })
    const apiRes = ({data: {documentID: 'documentID'}});
    ApiService.uploadFile.mockResolvedValue(apiRes);

    const input = wrapper.find({name: 'v-file-input'});
    input.vm.internalValue = oneMBFile;

    const select = wrapper.find({name: 'v-select'});
    select.findAll('.v-list-item').at(1).trigger('click');

    wrapper.vm.validate();
    wrapper.setData({validForm: true});
    expect(wrapper.vm.dataReady).toBeTruthy();

    await localVue.nextTick();

    const button = wrapper.find('#upload_form');
    //console.log(wrapper.html());
    button.trigger('click');

    await localVue.nextTick();
    expect(uploadFileSpy).toHaveBeenCalled();
    expect(setUploadedDocumentSpy).toHaveBeenCalledWith({}, apiRes.data);
    expect(wrapper.vm.alert).toBeTruthy();
    expect(wrapper.vm.alertMessage).toContain('success');
  });

  test('alert error if upload failed', async () => {    
    ApiService.uploadFile.mockRejectedValue(new Error('test error'));
    const input = wrapper.find({name: 'v-file-input'});
    input.vm.internalValue = oneMBFile;

    const select = wrapper.find({name: 'v-select'});
    select.findAll('.v-list-item').at(1).trigger('click');

    wrapper.vm.validate();
    wrapper.setData({validForm: true});
    expect(wrapper.vm.dataReady).toBeTruthy();

    await localVue.nextTick();

    const button = wrapper.find('#upload_form');
    button.trigger('click');

    await localVue.nextTick();
    await localVue.nextTick();
    expect(wrapper.vm.alert).toBeTruthy();
    expect(wrapper.vm.alertMessage).toContain('error');
  });

});


function mockStore(requestType, setUploadedDocument) {
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
      uploadFile: jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false)
    },
    getters: {
      documentTypeCodes: jest.fn().mockReturnValue(documentTypeCodes)
    },
    mutations: {
      setUploadedDocument
    }
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
      auth,
      root: rootStore,
      [requestType]: requestStore
    }
  });

  return store;
}
