# EDX test automation

For end-to-end testing, we are using testcafe, a node.js based front-end testing suite. In order to run any of the tests found in this directory, first install testcafe. More information on installation, etc. can be found [here](https://testcafe.io/documentation/402635/getting-started).

## Versions:

|element     |version     |
|------------|------------|
|node        |^12.22.1    |
|npm         |^7.12.1     |
|testcafe    |^1.17.0     |

## Running the tests:

The tests require certain environment variables to be set:

```
TEST_ADMIN_USERNAME={An administrator username for logging in}
TEST_ADMIN_PASSWORD={An administrator password}
BASE_URL={example: dev.educationdataexchange.gov.bc.ca/}
EDX_API_BASE_URL={example: https://edx-api-d4cdde-dev.apps.silver.devops.gov.bc.ca/}
API_HTML_STATUS_CLASS_THRESHOLD=399

# API TOKEN PROPERTIES
TOKEN_NAMESPACE={Openshift Namespace}
TOKEN_ENVIRONMENT={dev | test | prod} #Note: This will be redundant as we should use github environmental secrets
TOKEN_CLIENT_ID={keycloak client id}
TOKEN_CLIENT_SECRET={keycloak client secret}
```

There are multiple ways to do this. For example:

Add a `.env` (gitignored) file to the root of this directory with your environment variables in the following format:

```
<KEY>=<VALUE>
<KEY2>=<VALUE2>
...
```

or you can write a .bat or .sh script to set the values at runtime. This can be handy for triggering multiple tests.

Example shell script:

```
# simple shell script for automating tests
# set env vars
export TEST_ADMIN_USERNAME=<myTestUserName>
export TEST_ADMIN_PASSWORD=<myTestPassword>
echo "-- running smoke test"
# run a test
npm run smoke-test
```

Tests can be run from the root of this directory by calling `npm run <testname>` to invoke scripts defined in the [package.json](package.json) file. Tests can also be called explicitly by invoking the test like: `testcafe chrome:headless --incognito ./tests/test_cases/test-login-page-loads.js`, etc.

## Directory structure

    .
    ├── src                    # All test related files
    |   ├── config             # Configuration files
    |   ├── helpers            # Utility classes, helper methods
    |   ├── page_models        # Location for Testcafe page models (https://testcafe.io/documentation/402826/guides/concepts/page-model)
    |   ├── services           # Service classes for calling out to apis, etc.
    |   ├── test_cases         # Individual test cases
    |   └── test_suites        # Collections of test cases
    ├── .env                   # Optional environment variables (DO NOT ADD TO SOURCE CONTROL!)
    ├── .testcafe.json         # Tesecafe configuration
    ├── package.json           # Standard node stuff
    ├── package-lock.json      # Standard node stuff
    └── README.md              # This file

## Writing tests

For quickly getting up to speed, check out the following for a primer:

https://testing-library.com/docs/testcafe-testing-library/intro
https://testcafe.io/

You will probably want to start by adding a test file in the test_cases directory. For example, your test may be called `mytest.js`.
Check the helpers and services directory for reusable code that can be used in your test. Also consider placing model classes in the model directory
and creating TestCafe page models in the page_models directory to support your test case.

Next, add your test to the scripts block in the package.json file. If your test is part of a test suite, add it to the test suite in the
test_suites directory first. You should be able to call your test by issuing the following command: `npm run [your script name]`

If you need to add environment variables, put them in your .env file, then add additional structure by adding to /tests/config/index.js and /tests/config/constants.js.

TODO: Finish this

