# My App

Application template for a SvelteKit application with a MySQL database, where the application queries the database directly using SQL.

<!-- The application handles much of the boilerplate code and features needed for an application, including:

- Authentication
- Signup and login
- Password reseting -->

This template can be deployed anwhere on any infrastructure that supports MySQL.

**My Setup:** I use AWS EC2 for hosting the application, and AWS RDS for hosting the MySQL database. See [INFRASTRUCTURE.md](INFRASTRUCTURE.md) for instructions on setting up the infrastructure, and [DEPLOYMENT.md](DEPLOYMENT.md) for instructions on deploying the application.

## Local App Installation

**Clone the repository and install dependencies:**

```bash
git clone https://github.com/aarondeloach/my-app
cd my-app
npm install
```

## Local MySQL Database Setup

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

**Generate your `.env.local` file from `.env.template`:**

```bash
mv .env.template .env.local
```

**Then edit `.env.local` with your local environment variables.**

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

## Run the Application Locally

```bash
npm run dev
```

## First-Run Bootstrap (Account + User)

On the first application startup, database migrations run and the first account and its first user are created from these environment variables:

- `SETUP_ACCOUNT_TITLE` (optional, defaults to "Primary Account")
- `SETUP_USER_NAME` (optional, defaults to "Owner")
- `SETUP_USER_EMAIL` (required)
- `SETUP_USER_PASSWORD` (required)

Behavior:

- If no users exist and both required values are provided, bootstrap creates:
	- a default account (`SETUP_ACCOUNT_TITLE`) if no account exists yet
	- the first user (`SETUP_USER_NAME`) linked to that account
- If users already exist, bootstrap is skipped.
- If invalid setup variables are provided, startup fails with a configuration error.

Notes:

- Keep setup credentials in local environment only and do not commit them.
- After first successful startup (once the first account and user are created), remove the `SETUP_*` environment variables from `.env.local`.
- Add `SETUP_*` environment variables again only when bootstrapping a brand-new database with no users.



## My Infrastructure

For detailed instructions on setting up the infrastructure, please refer to the [INFRASTRUCTURE.md](INFRASTRUCTURE.md) file.

## My Deployment Strategy

For detailed instructions on deploying the application, please refer to the [DEPLOYMENT.md](DEPLOYMENT.md) file.
