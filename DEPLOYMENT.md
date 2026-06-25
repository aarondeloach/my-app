# My App Deployment Strategy

Application deployment instructions for using GitHub Actions.

If you haven't already done so, create a repository on GitHub and push your local code to the repository.

The application uses the `.github/workflows/deploy.yml` workflow to automatically deploy the application to an AWS EC2 instance whenever changes are pushed to the `main` branch of the repository.


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
