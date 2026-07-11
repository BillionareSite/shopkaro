// run this ONCE with: node scripts/migrate-theme.js
// It replaces hardcoded hex colors with CSS variable references across your entire src folder
// After running this, you only need to change theme.js to update the whole site

const fs = require('fs')
const path = require('path')

// Map of old hardcoded values → new CSS variable references
// These are Tailwind arbitrary value replacements
const replacements = [
  // Backgrounds
  ['bg-\\[#f6f1ea\\]', 'bg-[var(--bg)]'],
  ['bg-\\[#f6f1ea\\]/50', 'bg-[var(--bg)]/50'],
  ['bg-\\[#f6f1ea\\]/55', 'bg-[var(--bg)]/55'],
  ['bg-\\[#eadfd4\\]', 'bg-[var(--bg-muted)]'],
  ['bg-white/55', 'bg-[var(--bg-card)]/55'],
  ['bg-white/65', 'bg-[var(--bg-card)]/65'],

  // Text colors
  ['text-\\[#171313\\]', 'text-[var(--text-primary)]'],
  ['text-\\[#7b6f66\\]', 'text-[var(--text-muted)]'],
  ['text-\\[#9b8f86\\]', 'text-[var(--text-placeholder)]'],
  ['text-\\[#6f6258\\]', 'text-[var(--text-muted)]'],
  ['text-\\[#6d625a\\]', 'text-[var(--text-muted)]'],
  ['text-\\[#8c6048\\]', 'text-[var(--accent)]'],
  ['text-\\[#7b4d36\\]', 'text-[var(--accent)]'],

  // Button/dark backgrounds
  ['bg-\\[#171313\\]', 'bg-[var(--btn-dark)]'],
  ['bg-\\[#3a2a21\\]', 'bg-[var(--btn-dark-hover)]'],
  ['hover:bg-\\[#171313\\]', 'hover:bg-[var(--btn-dark)]'],
  ['hover:bg-\\[#3a2a21\\]', 'hover:bg-[var(--btn-dark-hover)]'],

  // Borders
  ['border-\\[#241a14\\]/10', 'border-[var(--border)]/10'],
  ['border-\\[#241a14\\]/15', 'border-[var(--border)]/15'],
  ['border-\\[#241a14\\]/20', 'border-[var(--border)]/20'],
  ['border-\\[#241a14\\]/30', 'border-[var(--border)]/30'],
  ['focus:border-\\[#171313\\]/30', 'focus:border-[var(--border)]/30'],
  ['hover:border-\\[#241a14\\]/30', 'hover:border-[var(--border)]/30'],

  // Shadows
  ['shadow-\\[#3d2619\\]/5', 'shadow-[var(--shadow)]/5'],
  ['shadow-\\[#3d2619\\]/15', 'shadow-[var(--shadow)]/15'],

  // Placeholder colors in className
  ['placeholder-\\[#9b8f86\\]', 'placeholder-[var(--text-placeholder)]'],

  // Input field backgrounds
  ['bg-\\[#f6f1ea\\] px-4 py-3', 'bg-[var(--bg-input)] px-4 py-3'],
  ['bg-\\[#f6f1ea\\] px-4 py-2', 'bg-[var(--bg-input)] px-4 py-2'],
]

// Files/folders to skip
const SKIP = ['node_modules', '.next', '.git', 'preowned', 'admin']

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP.some(s => entry.name === s)) files.push(...walk(fullPath))
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath)
    }
  }
  return files
}

const srcDir = path.join(__dirname, '..', 'src')
const files = walk(srcDir)

let totalChanged = 0

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  let original = content
  let changed = 0

  for (const [from, to] of replacements) {
    const regex = new RegExp(from, 'g')
    const before = content
    content = content.replace(regex, to)
    if (content !== before) changed++
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8')
    console.log(`✓ Updated: ${file.replace(srcDir, 'src')} (${changed} replacements)`)
    totalChanged++
  }
}

console.log(`\n✅ Done! Updated ${totalChanged} files.`)
console.log('🎨 Now change src/lib/theme.js to switch themes anytime.')