import sonarqubeScanner from "sonarqube-scanner";

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
  const options = {
    "sonar.organization": "gbandsmith",
    "sonar.projectKey": "ec2-leaser-backend",
    "sonar.projectName": "ec2-leaser-backend",
    "sonar.qualitygate.wait": "false",
    "sonar.sources": "src",
    "sonar.tests": "test",
    "sonar.javascript.lcov.reportPaths": "coverage/lcov.info",
    "sonar.testExecutionReportPaths": "sonar-report.xml"
  };
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
