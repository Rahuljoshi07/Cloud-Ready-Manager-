# Setup Guide - Azure CI/CD Pipeline Project

This guide will help you set up and deploy this project to Azure.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ GitHub account
- ✅ Microsoft Azure account (free tier works)
- ✅ Node.js 18.x or higher installed locally
- ✅ Git installed
- ✅ Azure CLI (optional, for advanced setup)

## 🚀 Quick Start

### Step 1: Fork/Clone the Repository

```bash
git clone <your-repository-url>
cd <project-directory>
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Test Locally

```bash
# Run tests
npm test

# Start development server
npm run dev

# Visit http://localhost:8080
```

## ☁️ Azure Setup

### Step 1: Create Azure App Service

#### Option A: Using Azure Portal (Recommended for Beginners)

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Web App"**
4. Fill in the details:
   - **Subscription**: Your subscription
   - **Resource Group**: Create new (e.g., "cicd-demo-rg")
   - **Name**: Choose unique name (e.g., "myapp-cicd-demo")
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Region**: East US (or nearest)
   - **Pricing plan**: F1 (Free) or B1 (Basic)
5. Click **"Review + Create"** → **"Create"**

#### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name cicd-demo-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name cicd-demo-plan \
  --resource-group cicd-demo-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name myapp-cicd-demo \
  --resource-group cicd-demo-rg \
  --plan cicd-demo-plan \
  --runtime "NODE:18-lts"
```

### Step 2: Get Publish Profile

1. In Azure Portal, go to your Web App
2. Click **"Get publish profile"** (top menu)
3. Download the `.publishsettings` file
4. Open it and copy the entire XML content

### Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:

   **Secret 1:**
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: Paste the publish profile XML content

   **Secret 2:**
   - Name: `AZURE_WEBAPP_NAME`
   - Value: Your app name (e.g., "myapp-cicd-demo")

### Step 4: Update Workflow File

Edit `.github/workflows/azure-deploy.yml`:

```yaml
env:
  AZURE_WEBAPP_NAME: 'your-app-name'  # ← Change this to your app name
```

## 🔄 Deploy

### Automatic Deployment

Simply push to the `main` branch:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

The GitHub Action will automatically:
1. ✅ Run tests
2. ✅ Build the application
3. ✅ Deploy to Azure
4. ✅ Verify deployment

### View Deployment Status

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. See the running workflow
4. Click on it to see detailed logs

## 🌐 Access Your Application

Once deployed, visit:
- `https://your-app-name.azurewebsites.net/`
- `https://your-app-name.azurewebsites.net/api/health`
- `https://your-app-name.azurewebsites.net/api/info`

## 🧪 Test Endpoints

```bash
# Replace with your actual URL
curl https://your-app-name.azurewebsites.net/api/health
curl https://your-app-name.azurewebsites.net/api/info
curl https://your-app-name.azurewebsites.net/api/status
```

## 📊 Monitor Your Application

### Azure Portal

1. Go to your Web App in Azure Portal
2. Check **"Metrics"** for performance
3. View **"Log stream"** for real-time logs
4. Use **"Application Insights"** for advanced monitoring

## 🔧 Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs
2. Verify secrets are correctly set
3. Ensure app name matches in workflow file
4. Check Azure App Service logs in portal

### Application Not Starting

1. Check Node.js version matches (18.x)
2. Verify all dependencies are in `package.json`
3. Check environment variables
4. Review logs in Azure Portal

### Tests Failing

```bash
# Run tests locally
npm test

# Check specific test
npm test -- health.test.js
```

## 🎯 For Resume/Portfolio

### What to Highlight:

1. **CI/CD Pipeline**: Automated testing and deployment
2. **Cloud Deployment**: Azure App Service integration
3. **DevOps Practices**: GitHub Actions, automated testing
4. **Monitoring**: Health checks, logging, metrics
5. **Containerization**: Docker support
6. **Best Practices**: Security, error handling, documentation

### Talking Points for Interviews:

- "Implemented automated CI/CD pipeline using GitHub Actions"
- "Deployed Node.js application to Azure App Service"
- "Configured automated testing with 90%+ code coverage"
- "Set up health monitoring and logging"
- "Implemented Docker containerization for consistent deployments"
- "Followed 12-factor app methodology"

## 📚 Next Steps

1. ✅ Enable Application Insights for monitoring
2. ✅ Set up staging environment
3. ✅ Add database integration
4. ✅ Implement caching with Redis
5. ✅ Add API authentication
6. ✅ Set up custom domain

## 🆘 Need Help?

- Check [Azure Documentation](https://docs.microsoft.com/azure)
- Visit [GitHub Actions Documentation](https://docs.github.com/actions)
- Review [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Remember**: Replace all placeholder values with your actual Azure resource names!
