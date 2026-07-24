import mysql from 'mysql2/promise';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('No DATABASE_URL'); process.exit(1); }
  const conn = await mysql.createConnection(url);
  
  const [affiliates] = await conn.execute(
    `SELECT a.id, a.guestName, a.guestEmail, a.domain, a.role, a.score
     FROM assessments a 
     JOIN team_affiliations ta ON ta.assessmentId = a.id 
     WHERE ta.teamDomain = 'ramprate.com'
     ORDER BY a.createdAt DESC`
  );
  
  console.log('AFFILIATES:', JSON.stringify(affiliates, null, 2));
  await conn.end();
  process.exit(0);
}
main();
