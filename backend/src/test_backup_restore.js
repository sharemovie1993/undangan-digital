const fs = require('fs');
const path = require('path');
const { BackupService } = require('./modules/backup/services/backup.service');
const { prisma } = require('./db');

async function runBackupRestoreTest() {
  console.log('--- 🧪 START TEST BACKUP & RESTORE ENGINE ---');

  try {
    // 1. Create a test user/invitation if empty
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Admin Test',
          email: 'admin@test.id',
          password: 'password_hash',
          role: 'ADMIN'
        }
      });
      console.log('✅ Created temporary test user:', user.email);
    }

    // 2. Test createBackup (Full with media)
    console.log('\n[1] Testing BackupService.createBackup()...');
    const backupResult = await BackupService.createBackup({ includeMedia: true });
    console.log('✅ Backup created successfully!');
    console.log('   - File:', backupResult.filename);
    console.log('   - Size:', backupResult.sizeFormatted);
    console.log('   - Counts:', JSON.stringify(backupResult.manifest.counts));
    console.log('   - SHA256 Checksum:', backupResult.manifest.checksumSha256);

    // Verify file exists on disk
    if (!fs.existsSync(backupResult.filePath)) {
      throw new Error(`File ${backupResult.filePath} does not exist on disk!`);
    }

    // 3. Test listBackups()
    console.log('\n[2] Testing BackupService.listBackups()...');
    const backupsList = await BackupService.listBackups();
    console.log(`✅ Backups list count: ${backupsList.length}`);
    const found = backupsList.find(b => b.filename === backupResult.filename);
    if (!found) {
      throw new Error('Created backup file not found in listBackups()!');
    }
    console.log('✅ Created backup correctly listed with manifest metadata.');

    // 4. Test restoreBackup()
    console.log('\n[3] Testing BackupService.restoreBackup()...');
    const restoreResult = await BackupService.restoreBackup(backupResult.filePath);
    console.log('✅ Restore executed successfully!');
    console.log('   - Message:', restoreResult.message);
    console.log('   - Restored counts:', JSON.stringify(restoreResult.restoredCounts));

    console.log('\n🎉 ALL BACKUP & RESTORE BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBackupRestoreTest();
