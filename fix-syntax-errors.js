#!/usr/bin/env node
/**
 * Fix syntax errors caused by aggressive console.log removal
 */

import fs from 'fs';
import path from 'path';

// List of files that need syntax fixing
const filesToFix = [
  'server/routes.ts',
  'server/email-service.ts', 
  'client/src/components/EnhancedAudioPlayer.tsx'
];

function fixSyntaxErrors() {
  console.log('🔧 Fixing syntax errors from aggressive console.log removal...');
  
  filesToFix.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    
    // Fix common syntax errors from console.log removal
    const fixes = [
      // Fix orphaned object literals
      { from: /\s+body:\s+req\.body,\s+userId:\s+req\.session\?\.\?userId,\s+sessionId:\s+req\.sessionID\s+\}\);/g, to: '' },
      
      // Fix orphaned property assignments
      { from: /\s+to:\s+options\.to,\s+subject:\s+options\.subject,\s+hasAttachments:\s+!!options\.attachments\?\.\?length\s+\}\);/g, to: '' },
      
      // Fix orphaned error objects
      { from: /\s+error:\s+event\.error,\s+utterance:\s+\{[^}]+\}\s+\}\);/g, to: '' },
      
      // Fix double semicolons and empty statements
      { from: /;;+/g, to: ';' },
      { from: /\{\s*;\s*\}/g, to: '{}' },
      
      // Fix missing statements after try blocks
      { from: /try\s*\{\s*const/g, to: 'try {\n      const' }
    ];
    
    fixes.forEach(fix => {
      const before = content;
      content = content.replace(fix.from, fix.to);
      if (content !== before) {
        changed = true;
        console.log(`✅ Applied fix to ${file}`);
      }
    });
    
    if (changed) {
      fs.writeFileSync(fullPath, content);
      console.log(`📝 Updated ${file}`);
    } else {
      console.log(`✓ No changes needed for ${file}`);
    }
  });
  
  console.log('🚀 Syntax error fixes complete!');
}

fixSyntaxErrors();