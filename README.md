# E-Invoicing Readiness & Gap Analyzer

This full-stack web application allows organizations to upload a CSV or JSON file of invoices to analyze their data's readiness against a standard e-invoicing (GETS) schema. The app provides a detailed report with scores for data quality, schema coverage, and rule compliance, helping businesses identify gaps before adopting new e-invoicing standards.

The application features a 3-step wizard UI built with React and TailwindCSS, a Node.js/Express backend for processing, and Supabase for report persistence.

### Key Features

- **File Upload**: Accepts CSV and JSON invoice files.
- **Data Analysis**: Validates data against 5 key business rules (e.g., totals balance, date formats).
- **Schema Mapping**: Compares user data fields to a standard GETS schema, identifying matched, close, and missing fields.
- **Scoring Engine**: Calculates four sub-scores (Data, Coverage, Rules, Posture) and a weighted overall readiness score (0-100).
- **Persistent Reports**: Saves analysis results to a Supabase database.
- **Shareable Links**: Generates unique, shareable links for each report.

---

### Setup and Running Locally

**Prerequisites:**

- Node.js (v18+)
- npm / yarn
- A free Supabase account

#### 1. Supabase Setup

1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  Navigate to the **SQL Editor** in your Supabase dashboard.
3.  Click **+ New query** and run the following SQL to create the `reports` table:
    ```sql
    CREATE TABLE reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      upload_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      report_json JSONB,
      scores_overall INT,
      expires_at TIMESTAMP WITH TIME ZONE
    );
    ```
4.  Go to **Project Settings > API**. Find your Project URL, `anon` key, and `service_role` key. You will need these for the `.env` files.

#### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file from the example
cp .env.example .env

# Edit .env and fill in your Supabase details
# SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, DATABASE_URL
```
