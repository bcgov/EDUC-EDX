/**
 * Runner test for testing uat
 * @type {{RequestHook: RequestHookConstructor, Role: RoleFactory, test: TestFn, t: TestController, ClientFunction: ClientFunctionFactory, Selector: SelectorFactory, RequestMock: RequestMockFactory, fixture: FixtureFn, userVariables: UserVariables, RequestLogger: RequestLoggerFactory, readonly default: TestCafeFactory}}
 */

const createTestCafe = require('testcafe');
const log = require('npmlog');

let testcafe = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe = tc;
        const runner = testcafe.createRunner();
        return runner
            .src(["src/test_cases/edx-new-user-invite"])
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
