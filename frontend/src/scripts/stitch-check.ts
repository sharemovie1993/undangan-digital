/**
 * Google Stitch Component Manifest CLI Checker
 * Usage: npx tsx src/scripts/stitch-check.ts
 */

import { STITCH_BLOCK_MANIFESTS } from '../stitch/BlockRegistry';

console.log('===============================================================');
console.log('       GOOGLE STITCH COMPONENT MANIFEST VALIDATOR CLI          ');
console.log('===============================================================\n');

let errorCount = 0;

for (const manifest of STITCH_BLOCK_MANIFESTS) {
  console.log(`[STITCH CHECK] Validating component: "${manifest.id}" (${manifest.name})...`);

  if (!manifest.id || typeof manifest.id !== 'string') {
    console.error(`❌ Manifest ID is missing or invalid.`);
    errorCount++;
  }

  if (!manifest.category) {
    console.error(`❌ Manifest "${manifest.id}" missing category.`);
    errorCount++;
  }

  if (!manifest.supportedEvents || manifest.supportedEvents.length === 0) {
    console.error(`❌ Manifest "${manifest.id}" has no supported event types.`);
    errorCount++;
  }

  console.log(`  ✓ Category: ${manifest.category}`);
  console.log(`  ✓ Supported Events: ${manifest.supportedEvents.join(', ')}`);
  console.log(`  ✓ Default CSS Tokens: ${JSON.stringify(manifest.defaultTokens)}`);
  console.log('');
}

console.log('===============================================================');
if (errorCount === 0) {
  console.log(`✓ ALL ${STITCH_BLOCK_MANIFESTS.length} GOOGLE STITCH COMPONENT MANIFESTS VALIDATED SUCCESSFULLY!`);
} else {
  console.error(`❌ VALIDATION FAILED WITH ${errorCount} ERRORS.`);
  process.exit(1);
}
console.log('===============================================================');
