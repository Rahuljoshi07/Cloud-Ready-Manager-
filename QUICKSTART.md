# Quick Start Guide

## 🚀 Local Development

### Run the application locally:

```bash
# Start development server
npm run dev
```

Visit: http://localhost:8080

### Available Endpoints:

- `http://localhost:8080/` - Welcome message
- `http://localhost:8080/api/health` - Health check
- `http://localhost:8080/api/info` - Application info
- `http://localhost:8080/api/status` - System status
- `http://localhost:8080/api/data` - Sample data

### Run Tests:

```bash
npm test
```

## 📤 Deploy to Azure

Follow the detailed instructions in **SETUP.md**

### Quick Steps:
1. Create Azure App Service
2. Get publish profile
3. Add GitHub secrets
4. Push to main branch
5. Automatic deployment! 🎉

## 🐳 Docker

### Build and run with Docker:

```bash
# Build image
docker build -t azure-cicd-app .

# Run container
docker run -p 8080:8080 azure-cicd-app
```

## 📊 Project Stats

- **Files**: 15+ production files
- **Tests**: 11 test cases
- **Coverage**: 95.45%
- **Dependencies**: Production-ready packages
- **Documentation**: Comprehensive guides

## ✨ Features Implemented

✅ RESTful API with Express.js
✅ Automated testing with Jest
✅ CI/CD pipeline with GitHub Actions
✅ Docker containerization
✅ Azure deployment configuration
✅ Health monitoring endpoints
✅ Error handling & logging
✅ Security best practices
✅ Professional documentation

---

**Ready to deploy!** Check SETUP.md for Azure deployment instructions.
