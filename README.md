# My App

This is an application template for a SvelteKit application with a MySQL database, where the application queries the database directly using SQL.

The application handles the creation of required tables/columns on first startup, and applies new SQL files from `/lib/server/db/migrations` in order, tracking which migrations have already run.

You can setup any infrastructure and deployment strategy you prefer. I use AWS EC2 and RDS instances for the [infrastructure](INFRASTRUCTURE.md), and [deploy](DEPLOYMENT.md) using GitHub Actions.


## Local App Installation

**Clone the repository and install dependencies:**

```bash
git clone https://github.com/aarondeloach/my-app
cd my-app
npm install
```

## Local Database Setup

This assumes you have MySQL installed and running on your local machine. If you don't have MySQL installed, please refer to the [MySQL installation guide](https://dev.mysql.com/doc/refman/8.4/en/installing.html) for your operating system.

**Connect to your local MySQL server:**

```bash
mysql -u root -p
# If mysql is not in your PATH, you may need to use the full path to the MySQL binary, for example (MacOS):
/usr/local/mysql/bin/mysql -u root -p
```

**Create a local MySQL database:**

```bash
mysql> create database my_app;
mysql> quit
```

## Local Environment Setup

**Generate your `.env.development` file from `.env.template`:**

```bash
mv .env.template .env.development
```

**Then edit `.env.development` with your local environment variables.**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=my_app
DB_PORT=3306
SETUP_ACCOUNT_TITLE='Acme Corp'
SETUP_USER_NAME='your name'
SETUP_USER_EMAIL=your_email_address
SETUP_USER_PASSWORD=your_password
```

>ℹ️ Quote values in the `.env.development` file if they contain special characters or spaces. For example, if your password is `P@ssw0rd!`, you should write it as `DB_PASSWORD="P@ssw0rd!"`, or if your name is `John Doe`, you should write it as `SETUP_USER_NAME="John Doe"`.


## Run the Application Locally

```bash
npm run dev
```

On the first application startup, database migrations run and the first account and user are created from these `.env.development` variables:

- `SETUP_ACCOUNT_TITLE` (optional, defaults to "Primary Account")
- `SETUP_USER_NAME` (optional, defaults to "Owner")
- `SETUP_USER_EMAIL` (required)
- `SETUP_USER_PASSWORD` (required)

Once the first-run bootstrap is complete, you can remove these environment variables from your `.env.development` file (or leave them for future use).
