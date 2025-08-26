import 'dotenv/config';
import http from 'http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const requestHandler = async (req, res) => {
  try {
    const result = await sql`SELECT version()`;
    const { version } = result[0];
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(version);
  } catch (error) {
    console.error('Database connection error:', error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Database error: ${error.message}`);
  }
};

http.createServer(requestHandler).listen(3000, () => {
  console.log("Server running at http://localhost:3000");
  console.log("Testing database connection...");
});
