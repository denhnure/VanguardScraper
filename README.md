# Vanguard Fund Scraper

Automatically scrapes NAV price and change data from Vanguard LifeStrategy 100 Equity Fund and sends results via email.

## Features

- ✅ Scrapes fund data using Puppeteer
- ✅ Handles cookie consent automatically
- ✅ Sends formatted email with results
- ✅ Attaches JSON data file
- ✅ Runs on GitHub Actions schedule
- ✅ Commits results to repository

## Setup Instructions

### 1. Configure Gmail App Password (Simple & Free)

Go to your repository → Settings → Secrets and variables → Actions

Add these **3 required secrets**:
```
EMAIL_USER: your.email@gmail.com
EMAIL_PASSWORD: your-16-character-app-password
RECIPIENT_EMAIL: recipient@email.com
```

### 2. Gmail App Password Setup Steps

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", enable **2-Step Verification** if not already enabled
3. Follow the setup process (you'll need your phone for verification)

#### Step 2: Generate App Password
1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **App passwords**
3. You may need to sign in again
4. Select app: **Mail**
5. Select device: **Other (Custom name)**
6. Enter name: **Vanguard Scraper** (or any name you prefer)
7. Click **Generate**
8. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
9. Use this as your `EMAIL_PASSWORD` secret

#### Step 3: Add GitHub Secrets
In your GitHub repo → Settings → Secrets and variables → Actions:

1. `EMAIL_USER`: Your Gmail address (e.g., your.email@gmail.com)
2. `EMAIL_PASSWORD`: The 16-character app password from Step 2
3. `RECIPIENT_EMAIL`: Where you want to receive reports

### 3. Enable GitHub Actions (If Needed)

1. Go to your repository → **Actions** tab
2. If prompted, click **"I understand my workflows, go ahead and enable them"**
3. The scraper will automatically run hourly between 9 AM - 5 PM UTC (weekdays)

---

## Alternative: OAuth 2.0 Method (More Secure)

🔒 **Note**: OAuth 2.0 is more secure but complex to set up

### Gmail OAuth 2.0 Setup
If you prefer the more secure OAuth 2.0 method, you'll need to:
1. Create a Google Cloud Project
2. Enable Gmail API
3. Set up OAuth 2.0 credentials
4. Generate refresh tokens
5. Use 5 secrets instead of 3:
   ```
   EMAIL_USER: your.email@gmail.com
   GMAIL_CLIENT_ID: your-oauth-client-id  
   GMAIL_CLIENT_SECRET: your-oauth-client-secret
   GMAIL_REFRESH_TOKEN: your-refresh-token
   RECIPIENT_EMAIL: recipient@email.com
   ```

---

## Test Locally (Optional)

```bash
# Install dependencies
npm install

# Set environment variables  
export EMAIL_USER="your.email@gmail.com"
export EMAIL_PASSWORD="your-16-character-app-password"
export RECIPIENT_EMAIL="recipient@email.com"

# Run scraper
node vanguard_puppeteer_scraper.js
```

## GitHub Actions Schedule

The scraper runs automatically:
- **Every hour** from 9 AM to 5 PM UTC
- **Monday to Friday** (market days)
- **Manual trigger** available in Actions tab

## Email Format

You'll receive:
- **HTML formatted email** with fund data table
- **JSON attachment** with raw data
- **Color-coded change** (green for positive, red for negative)

## Files

- `vanguard_puppeteer_scraper.js` - Main scraper with email functionality
- `.github/workflows/vanguard-scraper.yml` - GitHub Actions workflow
- `vanguard_fund_data.json` - Latest scraped data (auto-updated)

## Troubleshooting

### Email Not Sending
1. Check all 3 GitHub Secrets are set correctly
2. Verify 2-factor authentication is enabled on Gmail
3. Ensure app password was generated correctly
4. Check workflow logs in Actions tab for specific errors
5. Make sure you're using the app password, not your regular Gmail password

### Common App Password Issues
- **Invalid credentials**: Double-check the 16-character app password
- **2FA not enabled**: App passwords require 2-factor authentication
- **Wrong password**: Must use app password, not regular Gmail password
- **Spaces in password**: Remove spaces from app password when copying

### Scraper Failing
1. Website structure may have changed
2. Check Puppeteer logs in Actions tab  
3. Test locally first
4. Verify all dependencies are installed

## Why App Passwords Work Great

### Simplicity Benefits:
- ✅ **Simple setup** - Just 3 secrets instead of 5
- ✅ **No Google Cloud setup** - No need for API projects
- ✅ **Quick configuration** - 5 minutes vs 30 minutes
- ✅ **Easy troubleshooting** - Fewer moving parts
- ✅ **Works immediately** - No token refresh issues

### Still Secure:
- ✅ **Requires 2FA** - Your main account stays protected
- ✅ **App-specific** - Password only works for email
- ✅ **Revokable** - Can delete app password anytime
- ✅ **No main password exposure** - Uses separate credential
- ✅ **Completely FREE** for personal use
