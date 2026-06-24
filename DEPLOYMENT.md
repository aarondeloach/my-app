# My App Deployment Strategy

Application deployment instructions for using GitHub Actions.

If you haven't already done so, create a repository on GitHub and push your local code to the repository.

The application uses the `.github/workflows/deploy.yml` workflow to automatically deploy the application to an AWS EC2 instance whenever changes are pushed to the `main` branch of the repository.


## Manual App Deployment

To manually deploy the application, pull the latest changes from the repository, rebuild the application:

```bash
cd my-app
git pull origin main
npm install
npm run build
```

You'll have to reinitialize the `.env.production` file as it is not tracked in the repository. You can use the following command to generate the `.env.production` file with your secret environment variables:

```base
cat > .env.production << 'EOF'
DB_HOST=your_rds_endpoint
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=your_db_port
EOF
```

Then restart the application using PM2:

```bash
pm2 restart my-app
```
