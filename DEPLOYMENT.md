# My App Deployment Strategy

Application deployment instructions for using GitHub Actions.

If you haven't already done so, create a repository on GitHub and push your local code to the repository.


The application uses the `.github/workflows/deploy.yml` workflow to automatically deploy the application to an AWS EC2 instance whenever changes are pushed to the `main` branch of the repository.



## Manual App Updates

To manually update the application, pull the latest changes from the repository, rebuild the application, and restart it using PM2:

```bash
cd my-app
git pull origin main
npm install
npm run build
pm2 restart my-app
```
