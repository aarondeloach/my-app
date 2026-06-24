# My App Infrastructure

Application infrastructure for a Node.js backend with a SvelteKit frontend, using MySQL as the database.

Perform the following steps in the order listed to set up the infrastructure for the application.

## EC2 Setup

[EC2](https://aws.amazon.com/ec2/) (Elastic Compute Cloud) is a web service that provides resizable compute capacity in the cloud. It allows you to run virtual servers in the cloud, which can be used to host applications and services.

Setup EC2 instance with `Amazon Linux 2023`.

Setup the security group to allow HTTP traffic on port 80 and SSH traffic on port 22. (Node runs on port 3000, but we will use Nginx to reverse proxy the traffic from port 80 to port 3000.)

Connect to the EC2 instance using the `instance connect` option to open a terminal session. All commands below will be run in the AWS EC2 terminal session.

**Update the system**

```bash
sudo dnf update
```

## Setup Node.js and NPM

[Node.js](https://nodejs.org/) is a JavaScript runtime built on Chrome's V8 JavaScript engine. NPM is a package manager for Node.js packages, or modules.

[NVM](https://github.com/nvm-sh/nvm) (Node Version Manager) is a tool that allows you to manage multiple versions of Node.js on the same machine. It allows you to switch between different versions of Node.js and NPM, which is useful for testing and development.

**Install NVM (Node Version Manager):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

**IMPORTANT!** Close and reopen your terminal to start using nvm.

**Install the latest LTS (Long Term Support) version of Node.js and npm using nvm:**

```bash
nvm install --lts
```

## Setup Git

As the application is deployed from a [GitHub](https://github.com/) repository, we need to install [Git](https://git-scm.com/) on the EC2 instance.

```bash
sudo dnf install git -y
```

## Setup Nginx

[Nginx](https://nginx.org/) is a web server that can also be used as a reverse proxy, load balancer, and HTTP cache. In this setup, we will use Nginx to reverse proxy the traffic from port 80 to port 3000, where the Node.js application will be running.

**Install Nginx:**

```bash
sudo dnf install nginx -y
```

**Configure Nginx by editing the nginx.conf file:**

```bash
sudo nano /etc/nginx/nginx.conf
```

**Add the following server block to the nginx.conf file:**

Replace the existing server block with the following configuration. Make sure to update the `proxy_pass` directive to point to the correct port where your backend application is running (in this case, it's assumed to be running on port 3000).

```nginx
server {
    listen       80;
    server_name  _; # Put your domain name here if you have one

    location / {
        proxy_pass http://127.0.0.1:3000; # The port where the backend application runs
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Test the Nginx configuration:**

```bash
sudo nginx -t
```

**Start and enable Nginx:**

```bash
sudo systemctl start nginx
```

```bash
sudo systemctl enable nginx
```

**Verify that Nginx is running and listening on port 80 and 3000:**

```bash
sudo ss -tlnp | grep :80
```

```bash
sudo ss -tlnp | grep :3000
```

## Setup PM2

[PM2](https://pm2.keymetrics.io) is a process manager for Node.js applications that allows you to keep your application running in the background and automatically restart it if it crashes.

**Install PM2 globally:**

```bash
sudo npm install pm2 -g
```

**Set up PM2 to start on system boot:**

```bash
pm2 startup
```

## App Setup

**Clone the app repository and build the application:**

```bash
git clone https://github.com/aarondeloach/my-app
cd my-app
npm install
npm run build
```




**Use PM2 to manage the application:**

Start your application using the --name flag to give it a clean, recognizable label in your process list.

```bash
cd my-app
pm2 start build/index.js --name "my-app"
pm2 save
```

**Verify that the application is running:**

```bash
pm2 list
```

You should be able to access the application by visiting `http://[your-ec2-instance-ip]` in your web browser.

## Database Setup

[RDS](https://aws.amazon.com/rds/) (Relational Database Service) is a managed database service provided by AWS that makes it easy to set up, operate, and scale a relational database in the cloud. In this setup, we will use RDS to host a MySQL database for the application.

Create an new RDS instance using MySQL. Select the `Full configuration` option. Use the default settings (or customize as needed), but make sure to set the following:

- Self-managed credentials using a username and password that your codebase will use to connect to the database.
- Under Connectivity, connect to the EC2 instance created above.
- **No public access.** This means that the RDS instance will not be accessible from the internet, and can only be accessed from within the VPC (Virtual Private Cloud) where the EC2 instance is located. This locks down access to the database exclusively to your EC2 instance.
- Create a new VPC security group for the new RDS instance. This keeps everything separate and organized.

**My Setup:** For compliance reasons, I keep the database private (no external access) and manage schema changes through app-run migrations. On first startup, the app creates required tables/columns, then applies new SQL files from `/lib/server/db/migrations` in order, tracking which migrations have already run.

**IDE Access:** To connect to private RDS from an IDE, set up a jump box. This video walks through it: [How to Access a Private RDS Database (Using a Jump Box) From Your Home Network](https://www.youtube.com/watch?v=buqBSiEEdQc). If you manage the database externally, you should not provide `/lib/server/db/migrations` files, and fully manage the database from your IDE. Using both methods can lead to conflicts and inconsistencies in the schema.


## Whats Next?

Setup a certificate for HTTPS using [Let's Encrypt](https://letsencrypt.org/) and [Certbot](https://certbot.eff.org/). See [this guide](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04) for instructions on how to set up HTTPS with Nginx and Certbot.

Create a domain name and point it to your EC2 instance's public IP address. This will allow you to access your application using a custom domain name instead of the EC2 instance's public IP address.

Create a new GitHub repository for the application and push your local code to the repository. See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions on deploying the application.

Setup the application deployment strategy by following the instructions in [DEPLOYMENT.md](DEPLOYMENT.md).
