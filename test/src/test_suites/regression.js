const createTestCafe = require('testcafe');
const log = require('npmlog');

let testcafe = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe = tc;
        const runner = testcafe.createRunner();
        return runner
            // list multiple test files
            .src(["src/test_cases/edx-schools-frontend/test-school-inbox.js",
            "src/test_cases/edx-schools-frontend/test-school-message-display.js",
              "src/test_cases/edx-user-activation/"])
            .run();
    })
    .then(failedCount => {
        log.info('Tests failed: ' + failedCount);
        if(failedCount !== 0)
        {
            throw new Error("Test failed");
        }
        testcafe.close();
    });
