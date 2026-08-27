# 🤖 Gemini API Integration Guide untuk HerboraTech

## 📋 Fitur-Fitur yang Memerlukan Gemini API

### 1. **AI Health Consultant** (ai-consultation.html)
   - **Mode 1**: Symptom Checker — analisis gejala & rekomendasi awal
   - **Mode 2**: Drug Interactions — cek interaksi obat
   - **Mode 3**: Nutrition Advisor — rekomendasi nutrisi personal
   - **Mode 4**: Mental Health Support — konsultasi kesehatan mental
   - **Mode 5**: Herbal Advisor — rekomendasi jamu + safety check

### 2. **Herbal Medicine AI** (herbal.html Tab 2)
   - Real-time herbal recommendations based on user profile
   - Drug-herb interaction checking
   - Alternative herbal formulations

### 3. **Home Page AI Insight** (home.html)
   - Auto-generate health insights dari vital signs
   - Personalized health tips
   - Risk warning alerts

### 4. **Guided Examination AI** (guided-examination.html - Doctor Side)
   - Assist doctor with next steps during examination
   - Differential diagnosis suggestions
   - Examination protocol guidance

### 5. **Disease Risk Assessment** (disease-risk.html)
   - AI-powered risk scoring
   - Personalized prevention recommendations
   - Natural language explanations

### 6. **Medical Record Analysis** (medical-history.html)
   - Summarize patient medical history
   - Pattern recognition in health data
   - Trend analysis

---

## 🔧 Setup Instructions

### Prerequisites
- Gemini API Key (dapatkan dari: https://makersuite.google.com/app/apikey)
- Node.js >= 14 (untuk CLI)
- Environment variable management

### Step 1: Dapatkan Gemini API Key

```bash
# 1. Kunjungi https://makersuite.google.com/app/apikey
# 2. Klik "Create API Key"
# 3. Pilih project atau buat baru
# 4. Copy API key yang ter-generate
# 5. Simpan dengan aman
```

### Step 2: Setup Environment Variables

**Windows (Cmd):**
```cmd
# Buat file .env di root directory HerboraTech
setx GEMINI_API_KEY "your-api-key-here"
setx GEMINI_MODEL "gemini-pro"

# Restart terminal/command prompt
```

**Windows (PowerShell):**
```powershell
# Buat file .env di root directory
$env:GEMINI_API_KEY = "your-api-key-here"
$env:GEMINI_MODEL = "gemini-pro"

# Atau buat file .env dan gunakan dotenv package
```

**Linux/Mac (Bash):**
```bash
# Add ke ~/.bashrc atau ~/.zshrc
export GEMINI_API_KEY="your-api-key-here"
export GEMINI_MODEL="gemini-pro"

# Atau buat file .env dan source
source .env
```

### Step 3: Setup Node.js Backend (Firebase Cloud Functions)

HerboraTech memerlukan Cloud Functions untuk keamanan API key.

---

## 📦 Instalasi Google Generative AI SDK

### Untuk Browser (Client-Side - NOT RECOMMENDED karena API key exposed)
```html
<script src="https://cdn.jsdelivr.net/npm/@google/generative-ai"></script>
```

### Untuk Firebase Cloud Functions (RECOMMENDED)
```bash
cd firebase/functions
npm install @google/generative-ai dotenv
```

---

## 🏗️ Architecture

```
HerboraTech (Client)
    ↓
Frontend (HTML/JS)
    ↓ [HTTPS Request]
Firebase Cloud Functions
    ↓
Gemini API (Server-side, API key aman)
    ↓ [Response]
Frontend (Display)
```

**Mengapa Cloud Functions?**
- ✅ API key tersembunyi (tidak di-expose ke browser)
- ✅ Request dapat di-validate sebelum ke Gemini
- ✅ Rate limiting dapat di-implement
- ✅ Cost control lebih baik
- ✅ Secure

---

## 📝 Implementasi per Fitur

### 1. AI Consultation (5 Modes)

**Endpoint**: `POST /gemini/consultation`

**Request Body:**
```json
{
  "mode": "symptom_checker|drug_interactions|nutrition|mental_health|herbal",
  "userProfile": {
    "age": 35,
    "gender": "M",
    "medicalHistory": ["Diabetes", "Hypertension"],
    "currentMedications": ["Metformin", "Amlodipine"],
    "allergies": ["Penicillin"]
  },
  "query": "Saya pusing dan lelah",
  "context": "Gejala muncul 3 hari lalu setelah shift malam"
}
```

**Response:**
```json
{
  "mode": "symptom_checker",
  "analysis": "...",
  "possibleConditions": [...],
  "recommendations": [...],
  "warnings": ["Konsultasi dokter jika.."],
  "references": ["Grade B evidence from.."]
}
```

### 2. Herbal Advisor

**Endpoint**: `POST /gemini/herbal-recommendation`

**Request Body:**
```json
{
  "userHealth": {
    "condition": "hypertension",
    "currentMeds": ["Amlodipine"],
    "allergies": []
  },
  "query": "Herbal apa yang aman untuk tekanan darah?"
}
```

### 3. Home Page AI Insight

**Endpoint**: `POST /gemini/health-insight`

**Request Body:**
```json
{
  "vitals": {
    "hr": 72,
    "spo2": 98,
    "temp": 36.7,
    "steps": 6842,
    "stress": 35
  },
  "history": "7-day average data"
}
```

### 4. Disease Risk Assessment

**Endpoint**: `POST /gemini/risk-assessment`

**Request Body:**
```json
{
  "profile": {
    "age": 45,
    "bmi": 28,
    "vitalSigns": {...},
    "medicalHistory": [...],
    "lifestyle": {...}
  },
  "diseases": ["diabetes", "hypertension", "nafld"]
}
```

---

## 🔐 Security Best Practices

### DO ✅
- Simpan API key hanya di server (Cloud Functions)
- Validate user input sebelum ke Gemini
- Implement rate limiting (10-20 requests per user per hour)
- Log semua requests untuk audit
- Use HTTPS untuk semua komunikasi
- Encrypt sensitive data in transit

### DON'T ❌
- Jangan hardcode API key di frontend
- Jangan expose API key di browser
- Jangan kirim full medical history tanpa need-to-know
- Jangan cache responses tanpa consent

---

## 📊 Estimasi Biaya

**Gemini API Pricing (per 1 juta tokens):**
- Input: $0.5 / 1M tokens
- Output: $1.5 / 1M tokens

**Estimasi monthly HerboraTech (1000 users):**
- Rata-rata 5 AI queries/user/hari = 5000 queries/hari
- Rata-rata 500 tokens per query = 2.5M tokens/hari
- Monthly: 75M tokens = ~$50-75/bulan

**Cost Optimization:**
- Implement caching untuk queries sama
- Batch similar requests
- Use shorter prompts
- Implement conversation history trimming

---

## ⚠️ Compliance & Legal

- **HIPAA**: Jika menangani PHI (Protected Health Information), perlu compliance
- **GDPR**: Data pribadi user harus compliant
- **Disclaimer**: Gemini bukan medical advice, hanya educational
- **Liability**: Clearly state "AI is not a substitute for licensed healthcare provider"

---

## 🚀 Deployment Instructions

### Step 1: Get Gemini API Key

Visit https://aistudio.google.com/app/apikeys and create a new API key for your project.

### Step 2: Setup Firebase Project

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init
```

### Step 3: Configure Environment Variables

Create `.env` file in `firebase/functions/` directory:

```bash
cd firebase/functions
touch .env
```

Add to `.env`:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

**IMPORTANT**: Add `.env` to `.gitignore` to prevent exposing API key:
```bash
echo ".env" >> .gitignore
```

### Step 4: Update Cloud Functions Config

Edit `firebase/functions/.runtimeconfig.json` (create if doesn't exist):

```json
{
  "gemini": {
    "api_key": "your-gemini-api-key-here"
  }
}
```

Or set via Firebase CLI:

```bash
firebase functions:config:set gemini.api_key="your-api-key"
```

### Step 5: Deploy Cloud Functions

```bash
# From project root
firebase deploy --only functions

# Or from functions directory
cd firebase/functions
npm run deploy
```

### Step 6: Get Cloud Function URLs

After deployment, you'll see output like:

```
✔  Deploy complete!

Function URL (herbalAdvisor):
https://us-central1-PROJECT_ID.cloudfunctions.net/herbalAdvisor

Function URL (symptomChecker):
https://us-central1-PROJECT_ID.cloudfunctions.net/symptomChecker
```

### Step 7: Update Frontend URLs

Replace `PROJECT_ID` in `www/patient/herbal.html` (and other pages) with your actual Firebase project ID:

```javascript
// Change this:
const HERBAL_ADVISOR_URL = 'https://us-central1-vitalora-telemedicine.cloudfunctions.net/herbalAdvisor';

// To your actual project:
const HERBAL_ADVISOR_URL = 'https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/herbalAdvisor';
```

### Step 8: Test Endpoints

Use curl to test:

```bash
# Test Herbal Advisor
curl -X POST https://us-central1-PROJECT_ID.cloudfunctions.net/herbalAdvisor \
  -H "Content-Type: application/json" \
  -d '{
    "userProfile": {"age": 35, "gender": "M", "currentMedications": [], "allergies": []},
    "condition": "diabetes",
    "query": "Apa herbal yang baik untuk diabetes?",
    "userId": "test-user"
  }'
```

### Troubleshooting

**Error: "GEMINI_API_KEY is undefined"**
- Check `.env` file exists in `firebase/functions/`
- Run: `firebase functions:config:set gemini.api_key="YOUR_KEY"`
- Redeploy: `firebase deploy --only functions`

**Error: "CORS error"**
- Ensure CORS middleware is in Cloud Functions (already included in code)
- Check browser console for full error message

**Error: "Function not found"**
- Verify function is deployed: `firebase functions:list`
- Check region matches: default is `us-central1`

---

## 🚀 Quick Start Commands

For automated setup, use these commands in order:

```bash
# 1. Create .env file
echo "GEMINI_API_KEY=your-key-here" > firebase/functions/.env

# 2. Install dependencies
cd firebase/functions && npm install && cd ../..

# 3. Deploy functions
firebase deploy --only functions

# 4. Get function URLs from console output
# Then update PROJECT_ID in frontend files
```
