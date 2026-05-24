import pg from "pg";
import { supabase } from "./database.config";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;
let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) return;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("DB INIT: DATABASE_URL is not set. Skipping DDL table initialization. Operating in memory or direct API client mode.");
    isInitialized = true;
    return;
  }

  try {
    console.log("DB INIT: Initializing database tables...");
    const client = new Client({
      connectionString: dbUrl,
      ssl: dbUrl.includes("localhost") ? false : { rejectUnauthorized: false }
    });

    await client.connect();

    // 1. Create Events Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        time VARCHAR(100) NOT NULL,
        headliner VARCHAR(255),
        support JSONB DEFAULT '[]'::jsonb,
        subgenre VARCHAR(255),
        bpm INTEGER DEFAULT 128,
        ticket_price NUMERIC DEFAULT 0,
        available_tickets INTEGER DEFAULT 0,
        accent_color VARCHAR(100),
        raw_accent VARCHAR(50),
        door_policy TEXT,
        graphic_style VARCHAR(100),
        target_date TIMESTAMP,
        gif_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create Photo Groups Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS photo_groups (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100),
        description TEXT,
        cover_image TEXT,
        images JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(100) PRIMARY KEY,
        amount NUMERIC NOT NULL,
        guest_name VARCHAR(255),
        guest_email VARCHAR(255),
        type VARCHAR(50) DEFAULT 'ticket',
        type_name VARCHAR(100),
        count INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'PENDING',
        transaction_code VARCHAR(100),
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create VIP Tables Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vip_tables (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        capacity INTEGER DEFAULT 10,
        status VARCHAR(50) DEFAULT 'VACANT',
        guest_name VARCHAR(255),
        guest_email VARCHAR(255),
        order_id VARCHAR(100),
        bottle_notes TEXT,
        assigned_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create Checkins Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        order_id VARCHAR(100) PRIMARY KEY REFERENCES orders(order_id) ON DELETE CASCADE,
        checked_in BOOLEAN DEFAULT FALSE,
        checked_in_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("DB INIT: All database tables verified / created successfully.");
    await client.end();
  } catch (error: any) {
    console.error("DB INIT ERROR: Failed bootstrapping database tables:", error.message || error);
  }

  // 6. Bootstrap Supabase Storage Buckets programmatically
  if (supabase) {
    try {
      console.log("DB INIT: Bootstrapping Supabase storage buckets...");
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.warn("DB INIT WARNING: Could not query storage buckets:", listError.message);
      } else {
        const photoBucketExists = buckets?.some(b => b.name === "photos");
        if (!photoBucketExists) {
          const { error: createError } = await supabase.storage.createBucket("photos", {
            public: true,
            allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"]
          });
          
          if (createError) {
            console.error("DB INIT ERROR: Could not create 'photos' storage bucket:", createError.message);
          } else {
            console.log("DB INIT: Storage bucket 'photos' successfully created programmatically.");
          }
        } else {
          console.log("DB INIT: Storage bucket 'photos' already verified.");
        }
      }
    } catch (bucketError: any) {
      console.warn("DB INIT: Storage bootstrapping failed gracefully:", bucketError.message || bucketError);
    }
  }

  isInitialized = true;
}
