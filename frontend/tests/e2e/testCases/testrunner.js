const createTestCafe = require('testcafe');

let testcafe = null;
let runner = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe     = tc;
        runner = testcafe.createRunner();
         console.log(runner.src)
        return runner
            // list multiple test files
			.src([
                            "student-form.js", 
                            "mailsac.js" ,
                            "staff-login.jS"
                            
			])
            .browsers(['chrome'])
            .reporter('list')
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);
        testcafe.close();
    })