# My App Deployment Strategy

## GitHub Actions Deployment

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

The application uses the `.github/workflows/deploy.yml` workflow to automatically deploy the application to an AWS EC2 instance whenever changes are pushed to the `main` branch of the repository. In order for this to work, you will need to set up the following GitHub secrets in your repository:


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
