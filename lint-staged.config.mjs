import path from 'node:path'

const PACKAGE_DIRS = [
  'apps/web',
  'apps/admin',
  'apps/mobile',
  'services/server',
  'packages/im',
  'packages/analytics',
  'packages/shared-types',
]

/**
 * Run package-local eslint --fix (explore-ai style) for staged TS/TSX.
 * Monorepo adaptation: each workspace has its own ESLint config.
 */
function eslintFixByPackage(filenames) {
  const byPkg = new Map()

  for (const file of filenames) {
    const normalized = file.split(path.sep).join('/')
    const pkg = PACKAGE_DIRS.find(
      (dir) => normalized === dir || normalized.startsWith(`${dir}/`)
    )
    if (!pkg) continue
    if (!byPkg.has(pkg)) byPkg.set(pkg, [])
    byPkg.get(pkg).push(file)
  }

  return [...byPkg.entries()].map(([pkg, files]) => {
    const relFiles = files.map((file) => path.relative(pkg, file)).join(' ')
    return `pnpm --dir ${pkg} exec eslint --fix ${relFiles}`
  })
}

export default {
  '*.{ts,tsx}': (filenames) => [
    ...eslintFixByPackage(filenames),
    `prettier --write ${filenames.join(' ')}`,
  ],
  '*.{md,json,yml,yaml}': 'prettier --write',
}
