const sonarqubeScanner = require("sonarqube-scanner");

sonarqubeScanner(
  {
    serverUrl: "https://sonarcloud.io",
    token: process.env.SONAR_TOKEN,
    options: buildOptions()
  },
  () => {}
);

/**
 * Function that build the sonar option
 * @return {{}} return a json object representing options
 */
function buildOptions() {
  const options = {};
  options["sonar.organization"] = "gbandsmith";
  options["sonar.projectKey"] = "TBD";
  options["sonar.projectName"] = "TBD";
  options["sonar.qualitygate.wait"] = "false";
  options["sonar.sources"] = "src";
  options["sonar.exclusions"] = "";
  options["sonar.tests"] = "test";
  options["sonar.javascript.lcov.reportPaths"] = "coverage/lcov.info";
  options["sonar.testExecutionReportPaths"] = "test-reports/test-report.xml";
  if (process.env.BITBUCKET_PR_ID) {
    options["sonar.pullrequest.key"] = process.env.BITBUCKET_PR_ID;
    options["sonar.pullrequest.branch"] = process.env.BITBUCKET_BRANCH;
    options["sonar.pullrequest.base"] =
      process.env.BITBUCKET_PR_DESTINATION_BRANCH;
  } else {
    options["sonar.branch.name"] = process.env.BITBUCKET_BRANCH;
  }
  return options;
}
