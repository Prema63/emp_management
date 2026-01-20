import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE URL is missing, please check .env file.");
}

export const sql = postgres(process.env.DATABASE_URL, { ssl: "require"});

(async () => {
 try {
   const result = await sql`SELECT NOW()`;
   console.log("DB Connected at:", result[0].now);
 } catch (error) {
  
  console.log(error)
 }
})();
