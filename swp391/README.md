# swp391 - Deployment notes for Railway (MySQL)

This project was developed using SQL Server locally. Below are instructions for deploying the app on Railway using MySQL as the production database.

## Goals
- Keep local development using SQL Server.
- Make production on Railway use MySQL.
- Use environment variables provided by Railway to configure the datasource.

## What changed in the project
- `src/main/resources/application.properties` now reads database settings from environment variables with sensible local SQL Server fallbacks.
  - `DATABASE_URL` - full JDBC URL (e.g. `jdbc:mysql://host:port/dbname`) used when set.
  - `DB_USERNAME` / `DB_PASSWORD` - credentials
  - `HIBERNATE_DIALECT` - set to `org.hibernate.dialect.MySQLDialect` (or `MySQL8Dialect`) on Railway.
  - `PORT` - optional server port (Railway sets a port automatically in many cases).
- `pom.xml` now includes the MySQL JDBC driver (`mysql-connector-java`) as a runtime dependency.

## Railway deployment steps (summary)
1. Create a Railway project and link your Git repo (or push code to Railway via their CLI).
2. In Railway, add the MySQL plugin (create a MySQL database) or provision a MySQL instance and get its connection details.
3. In Railway project settings, set environment variables:
   - `DATABASE_URL` = Railway database JDBC URL (e.g. `jdbc:mysql://host:3306/dbname`). If Railway provides a URL in another format, convert or set `DB_USERNAME` and `DB_PASSWORD` separately.
   - `DB_USERNAME` = database user
   - `DB_PASSWORD` = database password
   - `HIBERNATE_DIALECT` = `org.hibernate.dialect.MySQLDialect` or `org.hibernate.dialect.MySQL8Dialect`
   - (Optional) `PORT` = Railway provided port
4. Deploy. Railway will build with Maven. The app will connect to MySQL using the env vars.

### Railway-specific tips

- If you connect your Git repository to Railway, choose the `swp391` project and set the build command to `./mvnw -DskipTests package` or let Railway auto-detect Maven.
- Add the MySQL plugin in Railway (Project -> Plugins -> MySQL). Railway will create the database and expose a connection string.
- Convert any non-JDBC URL to JDBC format if necessary: `jdbc:mysql://host:port/db` and set `DB_USERNAME` and `DB_PASSWORD` separately, or include credentials in the JDBC URL as `jdbc:mysql://host:port/db?user=user&password=pass`.
- Set `HIBERNATE_DIALECT` env var to `org.hibernate.dialect.MySQLDialect` or `org.hibernate.dialect.MySQL8Dialect`.

Common gotchas:

- Driver missing: Ensure `mysql:mysql-connector-java` is present in `pom.xml`. We added it as a runtime dependency.
- SSL/TLS: Railway MySQL may require TLS; the JDBC URL may need parameters such as `?useSSL=true&requireSSL=true&serverTimezone=UTC` depending on Railway's DB exposure. Example:
  `jdbc:mysql://host:3306/dbname?useSSL=true&requireSSL=true&serverTimezone=UTC`
- Schema changes: `spring.jpa.hibernate.ddl-auto=update` can help during testing but consider using Flyway or Liquibase for production schema management.

If you'd like, I can add a small startup health-check endpoint that prints which JDBC URL and dialect are being used (without printing passwords) to make validation easier on Railway.

## Data migration options from SQL Server (local) to Railway MySQL
Choose 1 depending on data size and complexity:

1. Export/import via CSV
   - Export each table from SQL Server to CSV (SSMS or `bcp`).
   - Use MySQL client (`LOAD DATA INFILE`) or MySQL Workbench to import CSVs into the corresponding tables.
   - Adjust AUTO_INCREMENT values and foreign key order.

2. Use migration/ETL tools (recommended for many tables)
   - Tools like AWS DMS, Hevo, Talend, or other ETL/replication tools support SQL Server -> MySQL migrations and can preserve types/constraints.
   - Alternatively, write a small script that reads from SQL Server and inserts into MySQL via JDBC.

3. Intermediate dump + import
   - Export from SQL Server to an intermediate CSV/SQL and then import into MySQL with appropriate type adjustments.

Notes:
- Review schema differences (data types, identity/AUTO_INCREMENT, case sensitivity) and adjust JPA entities or migration steps.
- Set `spring.jpa.hibernate.ddl-auto=none` in production if you don't want Hibernate to alter production schema. For initial testing `update` may work but be cautious.

### Concrete migration steps (examples)

1) CSV export/import (small datasets)

 - Export from SQL Server using `bcp` or SQL Server Management Studio. Example using `bcp` (PowerShell):

```powershell
# Export table `User` (example) to CSV
bcp "SELECT * FROM dbo.[User]" queryout user.csv -c -t"," -S localhost,1433 -U sa -P 12345
```

 - Import CSV into MySQL using `mysql` client (run where you have client access):

```powershell
# Import CSV into MySQL table `user`
mysql --host=host --port=3306 --user=user --password=pass dbname -e "LOAD DATA LOCAL INFILE 'user.csv' INTO TABLE user FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES;"
```

2) Use an ETL / replication tool (recommended for many tables or preserving types)

 - Use AWS DMS, Hevo, Talend, or similar tools that support SQL Server -> MySQL. These tools handle type mapping, LOBs, and large datasets better.

3) Adjust AUTO_INCREMENT after import

```sql
-- For MySQL set the AUTO_INCREMENT value after import
ALTER TABLE user AUTO_INCREMENT = (SELECT COALESCE(MAX(id), 0) + 1 FROM user);
```

Safety tip: Take a backup of your SQL Server DB before attempting migrations and test the migration on a non-production copy first.

## Local development
- Keep your local `application.properties` environment variables or run as-is (SQL Server config is the default fallback).

## Troubleshooting
- If you see JDBC driver class errors, ensure Railway built with the updated `pom.xml` and includes `mysql-connector-java` in the final artifact.
- For connection string issues, log the resolved `spring.datasource.url` on startup (be careful not to log secrets in production).

## Next steps (optional)
- Add a small Flyway or Liquibase migration setup to manage schema across environments.
- Add a CI step to run integration tests against a temporary MySQL instance.

---
If you want, I can:
- Add a small startup check that logs which DB type the app connected to.
- Add a Flyway config and initial migration scripts.
- Create an example migration script or a small Java utility to copy data from SQL Server to MySQL via JDBC.
