![Lifecycle:Stable](https://img.shields.io/badge/Lifecycle-Stable-97ca00)
# EDUC-STUDENT-PROFILE
This project contains the frontend for data change requests. 

# Ministry of Education Student Profile
The Student Profile application consists of a Vue.js frontend (UI and UX) and a Node.js backend (auth and session management). Currently early in the development process, so the front and backend are currently quite thin (only a single UI page).

## Before deployment
In order to deploy this project into OpenShift, you must create a secret for certificates by running the following command (be sure to replace the values in curly brackets with actual values):
``` sh
oc -n {YOUR_OPENSHIFT_NAMESPACE} create secret generic {YOUR_SECRET_NAME} --from-file=private-key={YOUR_PRIVATE_KEY_FILE} --from-file=certificate={YOUR_CERTIFICATE_FILE} --from-file=ca-certificate-l1k={YOUR_CA_CERTIFICATE_FILE}
```

## Reusable Templates
This repository contains multiple OpenShift templates that can be used to instantly spin up builds, deployments, and pipelines. These templates can be found in the [templates folder](https://github.com/bcgov/EDUC-STUDENT-PROFILE/tree/master/tools/templates).

## Documentation

* [Openshift Readme](openshift/README.md)
* [Education Student Profile Wiki](https://github.com/bcgov/EDUC-STUDENT-PROFILE/wiki)

## Getting Help or Reporting an Issue

To report bugs/issues/features requests, please file an [issue](https://github.com/bcgov/EDUC-STUDENT-PROFILE/issues).

## License

    Copyright 2020 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
