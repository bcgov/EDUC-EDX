## E2E Tests
The following documentation describes the E2E test folder structure and file purpose.

## Folder Structure

### /e2e
Any JavaScript files in the base /e2e folder will be run as TestCafe tests. Therefore any .js or .ts files must have the following code at the top of the file:
``` javascript
import { Selector } from 'testcafe';
```

### /e2e/config
This folder contains any environment variables needed to run the e2e tests (such as usernames or passwords). The config file will automatically pull environment variables set in the default section of the index.js file:
``` javascript
nconf.defaults({
    VARIABLE_KEY: VARIABLE_VALUE
});
```

To run locally, you must download all dependencies from the base project directory and create a local.json file which contains the required environment variables and set the NODE_ENV variable to "local" from the command line.

Download all npm dependencies (make sure you are in the /frontend directory):
``` bash
npm install
npm install testcafe -g
```

Set NODE_ENV in Powershell:
``` powershell
$env:NODE_ENV="local"
```

Set NODE_ENV in CMD:
``` cmd
set NODE_ENV=local
```

Set NODE_ENV in Linux Shells:
``` bash
export NODE_ENV=local
```

Run testcafe locally (from /frontend/tests/e2e directory):
``` bash
testcafe chrome,firefox ./
```

### /e2e/helpers
This folder contains any repeatable code (such as automated login) or any constants (such as JSON for a student). Any functions or constants stored here should be imported into the testcafe tests directly.


/* eslint-disable */
//Purpose:
//this script starts at OSPR splash page, navigates to CLP and allows user to log in with Basic BCeID, and takes a screenshot of completed forms
//Screenshots saved to C:\temp\artifacts\screenshots\  with -s path=artifacts/screenshots,fullPage=true,pathPattern=${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png NOTE: (that string not required in script if screenshots not taken)

/*
BEFORE RUNNING TESTCAFE COMMAND

Setting Local Env on Powershell:
$env:NODE_ENV="local"

Setting local Env on CMD:
set NODE_ENV=local
*/


//To Run:
//open CMD
//navigate to folder where .js files are stored (EG C:temp with cd .\..\, then cd temp)
//to run type: testcafe chrome sharene_basic_login_test.js --hostname 127.0.0.1 -s path=artifacts/screenshots,fullPage=true,pathPattern=${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png