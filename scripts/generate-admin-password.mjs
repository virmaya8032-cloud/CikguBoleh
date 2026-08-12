#!/usr/bin/env node
/**
 * Generate a bcrypt hash for the admin password.
 *
 *   node scripts/generate-admin-password.mjs "KataLaluanAnda"
 *   node scripts/generate-admin-password.mjs           (prompts, hidden input)
 *
 * Copy ONLY the printed hash into the ADMIN_PASSWORD_HASH env var (Vercel).
 * The plaintext password is never stored or logged.
 */
import bcrypt from "bcryptjs";
import readline from "node:readline";

function prompt(q) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // hide typed characters
    const stdout = process.stdout;
    rl._writeToOutput = (s) => { if (s.includes(q)) stdout.write(s); else stdout.write("*"); };
    rl.question(q, (ans) => { rl.close(); stdout.write("\n"); resolve(ans); });
  });
}

const pw = process.argv[2] || (await prompt("Kata laluan admin: "));
if (!pw || pw.length < 6) {
  console.error("Kata laluan terlalu pendek (minimum 6 aksara).");
  process.exit(1);
}
const hash = await bcrypt.hash(pw, 10);
console.log("\nADMIN_PASSWORD_HASH=" + hash + "\n");
console.log("Salin nilai selepas '=' ke Environment Variables Vercel.");
