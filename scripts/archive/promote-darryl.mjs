import mysql from 'mysql2/promise';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('No DATABASE_URL'); process.exit(1); }
  const conn = await mysql.createConnection(url);
  
  // First check Darryl's current details
  const [rows] = await conn.execute(
    "SELECT id, openId, name, email, role, createdAt, lastSignedIn FROM users WHERE name LIKE '%Darryl%' OR name LIKE '%darryl%' OR email LIKE '%darryl%'"
  );
  
  console.log('Darryl user record(s):', JSON.stringify(rows, null, 2));
  
  if (rows.length === 0) {
    console.log('No user account found for Darryl. He needs to log in first.');
    await conn.end();
    process.exit(0);
  }
  
  // Promote to admin
  for (const row of rows) {
    console.log(`Promoting user ${row.id} (${row.name} / ${row.email}) from "${row.role}" to "admin"...`);
    await conn.execute("UPDATE users SET role = 'admin' WHERE id = ?", [row.id]);
    console.log(`✅ Done — ${row.name} is now admin.`);
  }
  
  await conn.end();
  process.exit(0);
}
main();
