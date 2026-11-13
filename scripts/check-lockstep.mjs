// Fails if packages that must be released together are on different versions.
// `npm ls` only checks peer ranges, which didn't catch React Router drift
// (e.g. react-router 8 with @react-router/dev 7).
import fs from 'node:fs';

const GROUPS = [/^react-router$|^@react-router\//];

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
let failed = false;

for (const pattern of GROUPS) {
  const members = Object.keys(deps).filter((name) => pattern.test(name));
  const installed = Object.fromEntries(
    members.map((name) => [
      name,
      JSON.parse(fs.readFileSync(`node_modules/${name}/package.json`, 'utf8'))
        .version,
    ]),
  );
  const versions = new Set(Object.values(installed));
  if (versions.size > 1) {
    failed = true;
    console.error(`These packages must share one version:`);
    for (const [name, version] of Object.entries(installed)) {
      console.error(`  ${name}@${version}`);
    }
  }
}

if (failed) process.exit(1);
console.log('Lockstep packages are on matching versions.');
