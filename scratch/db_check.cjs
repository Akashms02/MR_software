const { Client } = require('pg');

const client = new Client({
  user: 'mr_software_user',
  host: '187.127.149.64',
  database: 'mrmedicaldb',
  password: 'mrsoftware@121#',
  port: 5432,
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to Database successfully!');

    console.log('\n--- Checking payslips for GMPY-2026-0005 (June 2026) ---');
    const res = await client.query(
      `SELECT id, employee_id, month, year, gross_salary, net_salary, payslip_url, created_at 
       FROM payslips 
       WHERE employee_id = 'GMPY-2026-0005' AND month = 'June' AND year = 2026`
    );
    console.log(`Found ${res.rows.length} rows:`);
    console.log(JSON.stringify(res.rows, null, 2));

    console.log('\n--- Checking all payslips for employee GMPY-2026-0005 ---');
    const resAll = await client.query(
      `SELECT id, employee_id, month, year, gross_salary, net_salary, created_at 
       FROM payslips 
       WHERE employee_id = 'GMPY-2026-0005'`
    );
    console.log(`Total payslips for this employee: ${resAll.rows.length}`);
    console.log(JSON.stringify(resAll.rows, null, 2));

  } catch (err) {
    console.error('Error running diagnostics:', err);
  } finally {
    await client.end();
  }
}

main();
