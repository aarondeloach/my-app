# My App Deployment Setup

I use [GitHub Actions](https://github.com/features/actions) to automatically deploy the application to the EC2 instance whenever changes are pushed to the `main` branch of the repository.

>‼️ The GitHub Actions workflow can report a false success. Because the runner cannot connect directly to the database, the workflow will succeed even if the database connection fails.

## GitHub Actions Setup

If you haven't already done so, create a repository on GitHub and push your local code to the repository.

Provide the following information in your repository's settings under "Secrets and variables" > "Actions": 

| Secret Name | Description |
|-------------|-------------|
| `SERVER_HOST` | The public DNS address of your AWS EC2 instance (e.g., `ec2-<instance-ip>.compute-1.amazonaws.com`) |
| `SERVER_USER` | The username for your AWS EC2 instance (e.g., `ec2-user`) |
| `SERVER_KEY` | The private SSH key for your AWS EC2 instance (in PEM format) |
| `DB_HOST` | The endpoint of your MySQL database (e.g., `<instance-id>.*******.<region>.rds.amazonaws.com`) |
| `DB_USER` | The username for your MySQL database (e.g., `admin`) |
| `DB_PASSWORD` | The password for your MySQL database |
| `DB_NAME` | The initial database created during the RDS instance setup (e.g., `my_app_db`) |
| `DB_PORT` | The port number for your MySQL database (usually 3306) |

> ℹ️ These settings are baked into the application's `.github/workflows/deploy.yml` workflow and will work without any additional configuration.


## Manual App Deployment

To manually deploy the application from the AWS EC2 instance terminal, pull the latest changes from the repository and rebuild the application:

```bash
cd my-app
git pull origin main
npm install
npm run build
```

Then restart the application using PM2:

```bash
pm2 restart my-app
```

>⚠️ The `.env.production` file is already present on the EC2 instance because it was created during the initial setup of the application. If you need to update any environment variables, edit the `.env.production` file and restart the application using PM2.