import * as formRules from '../../utils/institute/formRules';
import {isValidPEN} from '../../utils/validation';

// contains the mappings for validation field errors used in StepTwoValidateData.vue
// type: refers to the type of user input example input => <v-text-input>, select => <v-select>
// label: refers to label in input field.
// key: refers to the property in sdcSchoolCollectionStudent.
// options: various attributes to add into the input fields. further explanation below
// {
// rules: custom rules for input element
// items: only for type select and multiselect refers to the pinia store where the dropdown items reside
// itemValue: only for type select and multiselect refers to where we grab the value
// }

export const SDC_VALIDATION_FIELD_MAPPINGS = Object.freeze({
  LOCALID: {label: 'Local ID', key: 'localID', type: 'input', options: {}},
  STUDENT_PEN: {label: 'PEN', key: 'studentPen', type: 'input', options: {rules: [v => (!v || isValidPEN(v) || 'Invalid PEN')]}},
  LEGAL_FIRST_NAME: {label: 'Legal Given', key: 'legalFirstName', type: 'input', options: {}},
  LEGAL_MIDDLE_NAMES: {label: 'Legal Middle', key: 'legalMiddleNames', type: 'input', options: {}},
  LEGAL_LAST_NAME: {label: 'Legal Surname', key: 'legalLastName', type: 'input', options: {rules: [formRules.required()]}},
  USUAL_FIRST_NAME: {label: 'Usual Given', key: 'usualFirstName', type: 'input', options: {}},
  USUAL_MIDDLE_NAMES: {label: 'Usual Middle', key: 'usualMiddleNames', type: 'input', options: {}},
  USUAL_LAST_NAME: {label: 'Usual Surname', key: 'usualLastName', type: 'input', options: {}},
  DOB: {label: 'DOB', key: 'dob', type: 'datePicker', options: {}},
  GENDER_CODE: {label: 'Gender', key: 'gender', type: 'select', options: {items: 'genderCodes', itemValue: 'genderCode'}},
  GRADE_CODE: {label: 'Grade Code', key: 'enrolledGradeCode', type: 'select', options: {items: 'enrolledGradeCodes', itemValue: 'enrolledGradeCode'}},
  SPECIAL_EDUCATION_CATEGORY_CODE: {label: 'Special Education Category', key: 'specialEducationCategoryCode', type: 'select', options: {items: 'specialEducationCategoryCodes', itemValue: 'specialEducationCategoryCode'}},
  SCHOOL_FUNDING_CODE: {label: 'School Funding', key: 'schoolFundingCode', type: 'select', options: {items: 'schoolFundingCodes', itemValue: 'schoolFundingCode'}},
  NATIVE_ANCESTRY_IND: {label: 'Native Ancestry', key: 'nativeAncestryInd', type: 'input', options: {}},
  HOME_LANGUAGE_SPOKEN_CODE: {label: 'Home Language Spoken Code', key: 'homeLanguageSpokenCode', type: 'select', options: {items: 'homeLanguageSpokenCodes', itemValue: 'homeLanguageSpokenCode'}},
  OTHER_COURSES: {label: 'Other Courses', key: 'otherCourses', type: 'input', options: {}},
  SUPPORT_BLOCKS: {label: 'Support Blocks', key: 'supportBlocks', type: 'input', options: {}},
  ENROLLED_GRADE_CODE: {label: 'Enrolled Grade Codes', key: 'enrolledGradeCode', type: 'select', options: {items: 'enrolledGradeCodes', itemValue: 'enrolledGradeCode'}},
  ENROLLED_PROGRAM_CODE: {label: 'Enrolled Program Codes', key: 'filteredEnrolledProgramCodes', type: 'multiselect', options: {items: 'enrolledProgramCodes', itemValue: 'enrolledProgramCode'}},
  CAREER_PROGRAM_CODE: {label: 'Career Program Code', key: 'careerProgramCode', type: 'select', options: {items: 'careerProgramCodes', itemValue: 'careerProgramCode'}},
  NUMBER_OF_COURSES: {label: 'Number of Courses', key: 'numberOfCourses', type: 'input', options: {}},
  BAND_CODE: {label: 'Band Codes', key: 'bandCode', type: 'select', options: {items: 'bandCodes', itemValue: 'bandCode'}},
  POSTAL_CODE: {label: 'Postal Code', key: 'postalCode', type: 'input', options: {}}
});
