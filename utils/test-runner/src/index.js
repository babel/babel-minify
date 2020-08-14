/* eslint-disable no-console */
jest.setTimeout(25000);
const fs = require("./fs");
const path = require("path");
const babel = require("@babel/core");
const parseArgs = require("./argParser");

/**
 * Jest changes __dirname to relative path and the require of relative path
 * that doesn't start with "." will be a module require -
 *
 * require("./packages/babel-plugin...") vs require("packages/babel-plugin..");
 *
 * So we start the path with a "./"
 */
function pathJoin(...parts) {
  if (path.isAbsolute(parts[0])) {
    return path.join(...parts);
  }
  return "." + path.sep + path.join(...parts);
}

function testRunner(dir) {
  const pkgDir = pathJoin(dir, "../");

  const packageJson = JSON.parse(
    fs.readFileSync(pathJoin(pkgDir, "package.json"))
  );
  const pkgName = packageJson.name;

  const fixturesDir = pathJoin(pkgDir, "__tests__/fixtures");

  const fixtures = fs
    .readdirSync(fixturesDir)
    .filter(dir => fs.isDirectorySync(pathJoin(fixturesDir, dir)));

  const flags = parseArgs(process.argv);
  const updateFixtures = Boolean(flags["update-fixtures"]);

  describe(pkgName, () => {
    for (const fixture of fixtures) {
      const actualFile = pathJoin(fixturesDir, fixture, "actual.js");
      const expectedFile = pathJoin(fixturesDir, fixture, "expected.js");
      const skipFile = pathJoin(fixturesDir, fixture, "skip");
      const optionsFile = pathJoin(fixturesDir, fixture, "options.json");
      const babelOptionsFile = pathJoin(fixturesDir, fixture, "babel.json");

      if (fs.isFileSync(skipFile)) {
        test.skip(fixture, () => {});
        continue;
      }

      test(fixture, async () => {
        const actual = await fs.readFile(actualFile);

        let options = {};
        if (await fs.isFile(optionsFile)) {
          options = JSON.parse(await fs.readFile(optionsFile));
        }

        let babelOpts = {
          // set the default sourcetype to be script
          sourceType: "script"
        };

        if (await fs.isFile(babelOptionsFile)) {
          Object.assign(
            babelOpts,
            JSON.parse(await fs.readFile(babelOptionsFile))
          );
        }

        const currentPlugin = pathJoin(pkgDir, "src/index.js");

        if (Array.isArray(babelOpts.plugins)) {
          babelOpts.plugins = [[currentPlugin, options], ...babelOpts.plugins];
        } else {
          babelOpts.plugins = [[currentPlugin, options]];
        }

        // don't consider the project's babel.config.js
        babelOpts.configFile = false;

        const actualTransformed = babel.transformSync(actual, babelOpts).code;

        if (!(await fs.isFile(expectedFile))) {
          await fs.writeFile(expectedFile, actualTransformed);
          console.warn("Created fixture's expected file - " + expectedFile);
        } else if (updateFixtures) {
          const expected = await fs.readFile(expectedFile);
          if (expected !== actualTransformed) {
            await fs.writeFile(expectedFile, actualTransformed);
            console.warn("Updated fixture's expected file - " + expectedFile);
          }
        } else {
          const expected = await fs.readFile(expectedFile);
          expect(actualTransformed.trim()).toBe(expected.trim());
        }
      });
    }
  });
}

module.exports = testRunner;
