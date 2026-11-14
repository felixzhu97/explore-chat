/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'packages-not-to-apps',
      severity: 'error',
      comment:
        'Shared packages are reused by every client. Fix: move the code the package needs '
        + 'into packages/, or pass it in from the app.',
      from: { path: '^packages/' },
      to: { path: '^src/main/(web|admin|mobile)/' },
    },
    {
      name: 'apps-not-to-each-other',
      severity: 'error',
      comment:
        'web, admin and mobile ship separately. Fix: move the shared code into packages/ '
        + 'and import it by package name.',
      from: { path: '^src/main/(web|admin|mobile)/' },
      to: {
        path: '^src/main/(web|admin|mobile)/',
        pathNot: '^src/main/$1/',
      },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'A cycle means neither module can change alone. Fix: extract the shared part into '
        + 'a third module both import.',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(node_modules|\\.next|dist|build|coverage|ios|android)/' },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'],
    },
  },
};
