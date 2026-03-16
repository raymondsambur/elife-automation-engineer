const common = [
  // Feature files
  "features/**/*.feature",
  // Step definitions and support
  "--require-module ts-node/register",
  "--require features/support/**/*.ts",
  "--require features/step-definitions/**/*.ts",
  // Format
  "--format progress",
  "--format html:cucumber-report/report.html",
].join(" ");

module.exports = {
  default: common,
  ui: [
    "features/ui/**/*.feature",
    "--require-module ts-node/register",
    "--require features/support/**/*.ts",
    "--require features/step-definitions/ui/**/*.ts",
    "--format progress",
  ].join(" "),
  api: [
    "features/api/**/*.feature",
    "--require-module ts-node/register",
    "--require features/support/**/*.ts",
    "--require features/step-definitions/api/**/*.ts",
    "--format progress",
  ].join(" "),
  smoke: [
    "features/**/*.feature",
    "--tags @smoke",
    "--require-module ts-node/register",
    "--require features/support/**/*.ts",
    "--require features/step-definitions/**/*.ts",
    "--format progress",
  ].join(" "),
};
