export async function getData(apiMethod, queryParam) {
  try {
    const response = await apiMethod(queryParam);
    return response.data;
  } catch(e) {
    console.log(`Error while accessing ${apiMethod.name} API - ${e}`);
    throw e;
  }
}
  
export async function postData(apiMethod, _context, info){
  try {
    const response = await apiMethod(info);
    return response.data;
  } catch(e) {
    console.log(`Error while accessing ${apiMethod.name} API - ${e}`);
    throw e;
  }
}
