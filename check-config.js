#!/usr/bin/env node

/**
 * Configuration Diagnostic Tool
 * Run this to check if your environment is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 FixIt Studio - Configuration Diagnostic\n');
console.log('='.repeat(50));

let issuesFound = 0;
let checksPass = 0;

// Check 1: Node.js version
console.log('\n✓ Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 18) {
  console.log(`  ✅ Node.js ${nodeVersion} (OK)`);
  checksPass++;
} else {
  console.log(`  ❌ Node.js ${nodeVersion} (Need 18 or higher)`);
  issuesFound++;
}

// Check 2: .env.local exists
console.log('\n✓ Checking .env.local file...');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('  ✅ .env.local file exists');
  checksPass++;
  
  // Check 3: Read and validate environment variables
  console.log('\n✓ Checking environment variables...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const optionalVars = [
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'TEAM_EMAIL',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_WHATSAPP_NUMBER',
    'TEAM_WHATSAPP_NUMBER'
  ];
  
  let hasAllRequired = true;
  
  requiredVars.forEach(varName => {
    const regex = new RegExp(`${varName}=(.+)`);
    const match = envContent.match(regex);
    
    if (!match || !match[1] || match[1].trim() === '' || match[1].includes('your_') || match[1].includes('xxxxx')) {
      console.log(`  ❌ ${varName} - Missing or placeholder value`);
      issuesFound++;
      hasAllRequired = false;
    } else {
      const value = match[1].trim();
      if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
        if (value.startsWith('https://') && value.includes('.supabase.co')) {
          console.log(`  ✅ ${varName} - Looks good`);
          checksPass++;
        } else {
          console.log(`  ⚠️  ${varName} - Format seems incorrect (should be https://xxx.supabase.co)`);
          issuesFound++;
        }
      } else if (varName === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
        if (value.startsWith('eyJ')) {
          console.log(`  ✅ ${varName} - Looks good`);
          checksPass++;
        } else {
          console.log(`  ⚠️  ${varName} - Format seems incorrect (should start with eyJ)`);
          issuesFound++;
        }
      } else {
        console.log(`  ✅ ${varName} - Set`);
        checksPass++;
      }
    }
  });
  
  console.log('\n✓ Optional variables (for notifications):');
  let optionalCount = 0;
  optionalVars.forEach(varName => {
    const regex = new RegExp(`${varName}=(.+)`);
    const match = envContent.match(regex);
    if (match && match[1] && match[1].trim() !== '' && !match[1].includes('your_')) {
      console.log(`  ✅ ${varName} - Configured`);
      optionalCount++;
    } else {
      console.log(`  ⚪ ${varName} - Not configured (optional)`);
    }
  });
  
  if (optionalCount === 0) {
    console.log('\n  ℹ️  Note: Email and WhatsApp notifications are not configured.');
    console.log('     Database will still work, but you won\'t receive notifications.');
  }
  
} else {
  console.log('  ❌ .env.local file NOT FOUND');
  console.log('     Please copy .env.local.template to .env.local');
  issuesFound++;
}

// Check 4: package.json exists
console.log('\n✓ Checking package.json...');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('  ✅ package.json exists');
  checksPass++;
} else {
  console.log('  ❌ package.json NOT FOUND');
  issuesFound++;
}

// Check 5: node_modules exists
console.log('\n✓ Checking node_modules...');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('  ✅ node_modules exists (dependencies installed)');
  checksPass++;
} else {
  console.log('  ❌ node_modules NOT FOUND');
  console.log('     Please run: npm install');
  issuesFound++;
}

// Check 6: Required files exist
console.log('\n✓ Checking project files...');
const requiredFiles = [
  'app/api/consultation/route.ts',
  'database/schema.sql',
  'lib/sendEmail.ts',
  'lib/sendWhatsApp.ts'
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
    checksPass++;
  } else {
    console.log(`  ❌ ${file} - Missing`);
    issuesFound++;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 DIAGNOSTIC SUMMARY\n');
console.log(`✅ Checks Passed: ${checksPass}`);
console.log(`❌ Issues Found: ${issuesFound}`);

if (issuesFound === 0) {
  console.log('\n🎉 CONFIGURATION LOOKS GOOD!\n');
  console.log('Next steps:');
  console.log('1. Make sure you created the database table in Supabase');
  console.log('2. Run: npm run dev');
  console.log('3. Test form submission at http://localhost:3000');
} else {
  console.log('\n⚠️  ISSUES DETECTED!\n');
  console.log('Please fix the issues above, then run this diagnostic again.');
  console.log('\nCommon fixes:');
  if (!fs.existsSync(envPath)) {
    console.log('- Copy .env.local.template to .env.local');
  }
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('- Run: npm install');
  }
  console.log('- Check SETUP_CHECKLIST.md for detailed instructions');
  console.log('- Check TROUBLESHOOTING.md for common issues');
}

console.log('\n' + '='.repeat(50) + '\n');

// Exit with code based on issues
process.exit(issuesFound > 0 ? 1 : 0);
