# EC2 Deployment Guide for Address Risk API

This guide explains how to deploy the Address Risk API to an AWS EC2 instance.

## Prerequisites

- An AWS account with permissions to create and manage EC2 instances
- SSH client installed on your local machine
- Access to your domain's DNS settings (optional for custom domain)

## 1. Launch an EC2 Instance

1. **Login to AWS Console** and navigate to EC2 dashboard
2. **Launch a new instance**:
   - Choose Amazon Linux 2023 AMI (recommended)
   - Select instance type (t2.micro is sufficient for testing)
   - Configure security groups (see below)
   - Create or select a key pair for SSH access
   - Launch the instance

3. **Configure Security Groups**:
   - Allow SSH (Port 22) from your IP address
   - Allow HTTP (Port 80) from anywhere
   - Allow HTTPS (Port 443) from anywhere
   - Allow custom TCP (Port 8000) from anywhere

## 2. Connect to Your Instance

```bash
ssh -i path/to/your-key.pem ec2-user@your-instance-public-ip
```

## 3. Install Docker and Docker Compose

```bash
# Update packages
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and log back in for group changes to take effect
exit
# (reconnect via SSH)
```

## 4. Deploy the Application

1. **Clone your repository**:
   ```bash
   git clone https://github.com/yourusername/address-risk-api.git
   cd address-risk-api
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Build and start the application**:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

Your application should now be running at `http://your-instance-public-ip:8000`.

## 5. Setup a Domain (Optional)

1. **Add an A record** in your domain's DNS settings pointing to your EC2 instance's public IP.

2. **Install Nginx** as a reverse proxy:
   ```bash
   sudo yum install nginx -y
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

3. **Configure Nginx**:
   Create a new site configuration:
   ```bash
   sudo nano /etc/nginx/conf.d/address-risk-api.conf
   ```

   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. **Test and reload Nginx**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 6. Setup HTTPS with Let's Encrypt (Optional)

1. **Install Certbot**:
   ```bash
   sudo yum install certbot python3-certbot-nginx -y
   ```

2. **Obtain a certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Setup automatic renewal**:
   ```bash
   sudo echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
   ```

## 7. Maintenance Considerations

1. **Monitoring**:
   - Setup CloudWatch for EC2 monitoring
   - Consider using the AWS CLI for automated resource monitoring

2. **Backups**:
   - Regularly backup your SQLite database from the Docker volume
   - Set up automated snapshots of your EC2 instance

3. **Updates**:
   - Keep your EC2 instance updated: `sudo yum update -y`
   - Update Docker: `sudo yum update docker -y`
   - Update your application code as needed

## 8. Automating Deployment (CI/CD)

Consider setting up a CI/CD pipeline using GitHub Actions or AWS CodePipeline to automate deployments when you push changes to your repository.

## 9. Cost Management

Monitor your AWS costs regularly. A t2.micro instance is eligible for the AWS free tier (for 12 months), but other resources may incur charges.
