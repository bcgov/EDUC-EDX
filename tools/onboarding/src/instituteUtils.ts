import { getData, postData } from './restUtils';
import { SearchCriteria, SearchFilter, SearchValueType, SearchCondition } from './apiSearchParams';

const SCHOOL_ENDPOINT = `/api/v1/institute/school`;
const DISTRICT_ENDPOINT = `/api/v1/institute/district`;

async function getSchoolsBySchoolNumber(schoolNumber: string): Promise<SchoolEntity[]> {
  const schoolSearchCriteria: SearchCriteria[] = [{
    condition: null,
    searchCriteriaList: [
      {
        key: 'schoolNumber',
        operation: SearchFilter.EQUAL,
        value: schoolNumber,
        valueType: SearchValueType.STRING,
        condition: SearchCondition.AND
      },
      {
        key: 'closedDate',
        operation: SearchFilter.EQUAL,
        value: null,
        valueType: SearchValueType.STRING,
        condition: SearchCondition.AND
      }
    ]
  }];

  const schoolSearchParam = {
    params: {
      searchCriteriaList: JSON.stringify(schoolSearchCriteria)
    }
  };

  const url = `${process.env.INSTITUTE_SERVICE_URL}${SCHOOL_ENDPOINT}/paginated`;
  const userSchoolResult = await getData<PaginatedSchoolResponse>(url, schoolSearchParam);
  return userSchoolResult.content;
}

export async function getDistrictIdByDistrictNumber(districtNumber: string) {
  const url = `${process.env.INSTITUTE_SERVICE_URL}${DISTRICT_ENDPOINT}`;
  const districtResponse = await getData<DistrictEntity[]>(url);
  for (const district of districtResponse) {
    if (district.districtNumber === districtNumber) {
      return district;
    }
  }
}

export async function getSchoolByMincode(mincode: string) {
  const districtNumber = mincode.slice(0, 3);
  const schoolNumber = mincode.slice(3);

  const schools = await getSchoolsBySchoolNumber(schoolNumber);
  const districtEntity = await getDistrictIdByDistrictNumber(districtNumber);

  if (districtEntity) {
    return schools.find(s => s.districtId === districtEntity.districtId);
  }
}
