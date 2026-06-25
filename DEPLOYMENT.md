# My App Deployment Strategy

Application deployment instructions for using GitHub Actions.

If you haven't already done so, create a repository on GitHub and push your local code to the repository.

The application uses the `.github/workflows/deploy.yml` workflow to automatically deploy the application to an AWS EC2 instance whenever changes are pushed to the `main` branch of the repository.


## Manual App Deployment

To manually deploy the application, pull the latest changes from the repository, rebuild the application:

```bash
cd my-app
git pull origin main
```

You'll have to create the `.env.production` file as it is not tracked in the repository.

```bash
touch .env.production
```

Open the file for editing.

```bash
nano .env.production
```

Copy and paste the following lines into the `.env.production` file, replacing the placeholder values with your actual database credentials and desired setup values.

```bash
DB_HOST=your_rds_endpoint
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=your_db_port
```


Install and build the application:

```bash
npm install
npm run build
```


Then restart the application using PM2:

```bash
pm2 restart my-app
```
