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
  options["sonar.projectKey"] = "ec2-leaser-frontend";
  options["sonar.projectName"] = "ec2-leaser-frontend";
  options["sonar.qualitygate.wait"] = "false";
  options["sonar.sources"] = "src";
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
