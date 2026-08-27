/**
 * HerboraTech Firebase Cloud Functions
 * Gemini API Integration for AI Features
 *
 * Endpoints:
 * - POST /symptomChecker
 * - POST /drugInteractions
 * - POST /nutritionAdvisor
 * - POST /mentalHealthSupport
 * - POST /herbalAdvisor
 * - POST /healthInsight
 * - POST /riskAssessment
 */

import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase
admin.initializeApp();

// Get Gemini API Key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || functions.config().gemini?.api_key;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not configured. Set it via:');
  console.error('   firebase functions:config:set gemini.api_key="your-key"');
  console.error('   OR create .env file with GEMINI_API_KEY=your-key');
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// CORS configuration
const corsHandler = cors({ origin: true });

// Rate limiting: simple in-memory store (use Redis for production)
const rateLimitStore = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const limit = 20; // requests per hour

  if (!rateLimitStore.has(userId)) {
    rateLimitStore.set(userId, []);
  }

  const timestamps = rateLimitStore.get(userId);
  const recentRequests = timestamps.filter(t => now - t < 3600000); // 1 hour

  if (recentRequests.length >= limit) {
    return false;
  }

  recentRequests.push(now);
  rateLimitStore.set(userId, recentRequests);
  return true;
}

// ============ 1. SYMPTOM CHECKER ============
export const symptomChecker = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const { userProfile, symptoms, duration, context, userId } = req.body;

      // Rate limiting
      if (!checkRateLimit(userId)) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      const prompt = `
You are a medical AI assistant for HerboraTech telemedicine platform. Analyze these symptoms and provide preliminary assessment ONLY (NOT medical diagnosis).

Patient Profile:
- Age: ${userProfile.age}
- Medical History: ${userProfile.medicalHistory?.join(', ') || 'None'}
- Current Medications: ${userProfile.currentMedications?.join(', ') || 'None'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}

Symptoms Reported:
- ${symptoms}
- Duration: ${duration}
- Additional Context: ${context}

Please provide:
1. Symptom Analysis (brief)
2. Possible Conditions (Top 3, NOT diagnosis)
3. Red Flags (when to see doctor immediately)
4. Initial Recommendations (lifestyle, home care)
5. When to Consult Doctor

IMPORTANT: This is NOT medical diagnosis. Recommend professional medical consultation.

Format your response as JSON:
{
  "analysis": "...",
  "possibleConditions": [{"name": "...", "likelihood": "low|medium|high"}],
  "redFlags": ["..."],
  "recommendations": ["..."],
  "urgency": "low|medium|high"
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: responseText };

      // Log request for audit
      await admin.firestore().collection('audit_logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId,
        action: 'symptom_checker',
        status: 'success'
      });

      res.json(analysis);
    } catch (error) {
      console.error('Symptom Checker Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============ 2. DRUG INTERACTIONS CHECKER ============
export const drugInteractions = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const { medications, newMedication, userId } = req.body;

      if (!checkRateLimit(userId)) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      const prompt = `
You are a pharmaceutical AI advisor for HerboraTech. Check drug interactions ONLY (NOT prescribing advice).

Current Medications:
${medications.map((m, i) => `${i + 1}. ${m}`).join('\n')}

New/Proposed Medication:
${newMedication}

Please analyze:
1. Direct Interactions (if any)
2. Severity (minor|moderate|severe)
3. Mechanism of Interaction
4. Recommendations (timing, monitoring)
5. Foods/Supplements to Avoid

Format as JSON:
{
  "newMedication": "...",
  "interactions": [
    {
      "drug": "...",
      "severity": "minor|moderate|severe",
      "mechanism": "...",
      "recommendation": "..."
    }
  ],
  "monitoring": ["..."],
  "safeToTake": true/false
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: responseText };

      await admin.firestore().collection('audit_logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId,
        action: 'drug_interactions',
        status: 'success'
      });

      res.json(analysis);
    } catch (error) {
      console.error('Drug Interactions Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============ 3. NUTRITION ADVISOR ============
export const nutritionAdvisor = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const { userProfile, healthGoal, dietaryPreferences, userId } = req.body;

      if (!checkRateLimit(userId)) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      const prompt = `
You are a nutrition AI advisor for HerboraTech. Provide personalized nutrition recommendations.

Patient Profile:
- Age: ${userProfile.age}, Gender: ${userProfile.gender}
- BMI: ${userProfile.bmi}, Activity Level: ${userProfile.activityLevel}
- Conditions: ${userProfile.conditions?.join(', ') || 'None'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}

Health Goal: ${healthGoal}
Dietary Preferences: ${dietaryPreferences}

Please provide:
1. Macronutrient Targets (protein, carbs, fats)
2. Daily Calorie Recommendation
3. Foods to Prioritize
4. Foods to Avoid
5. Sample Meal Plan (1 day)
6. Hydration Recommendation

Format as JSON:
{
  "macroTargets": {
    "protein": "g",
    "carbs": "g",
    "fats": "g"
  },
  "dailyCalories": "kcal",
  "priorityFoods": ["..."],
  "avoidFoods": ["..."],
  "sampleMealPlan": [
    {
      "meal": "Breakfast",
      "examples": ["..."]
    }
  ],
  "hydration": "liters/day"
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: responseText };

      await admin.firestore().collection('audit_logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId,
        action: 'nutrition_advisor',
        status: 'success'
      });

      res.json(analysis);
    } catch (error) {
      console.error('Nutrition Advisor Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============ 4. MENTAL HEALTH SUPPORT ============
export const mentalHealthSupport = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const { concern, symptoms, duration, userId } = req.body;

      if (!checkRateLimit(userId)) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      const prompt = `
You are a mental health support AI for HerboraTech. Provide supportive resources and coping strategies (NOT therapy).

Concern: ${concern}
Symptoms: ${symptoms}
Duration: ${duration}

Please provide:
1. Acknowledgment & Validation
2. Possible Conditions (informational only)
3. Coping Strategies (immediate, short-term)
4. Grounding Techniques
5. When to Seek Professional Help (RED FLAGS)
6. Mental Health Resources/Hotlines

IMPORTANT: If crisis indicators present, strongly recommend immediate professional help.

Format as JSON:
{
  "validation": "...",
  "possibleConditions": ["..."],
  "copingStrategies": ["..."],
  "groundingTechniques": [
    {
      "name": "...",
      "steps": ["..."]
    }
  ],
  "redFlags": ["..."],
  "resources": [
    {
      "name": "...",
      "contact": "..."
    }
  ],
  "needsProfessionalHelp": true/false
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: responseText };

      await admin.firestore().collection('audit_logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId,
        action: 'mental_health_support',
        status: 'success'
      });

      res.json(analysis);
    } catch (error) {
      console.error('Mental Health Support Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============ 5. HERBAL ADVISOR ============
export const herbalAdvisor = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const { userProfile, condition, query, userId } = req.body;

      if (!checkRateLimit(userId)) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      const prompt = `
You are a herbal medicine AI advisor for HerboraTech. Provide evidence-based herbal recommendations for Indonesia (Jamu).

Patient Profile:
- Age: ${userProfile.age}
- Condition: ${condition}
- Current Medications: ${userProfile.currentMedications?.join(', ') || 'None'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}

Question: ${query}

Please provide:
1. Recommended Herbs (Top 3)
   - Latin name
   - Traditional name (Jamu/herbal)
   - Active compounds
   - Evidence Grade (A/B/C/D)
2. Dosage & Preparation
3. Duration of Use
4. Expected Results Timeline
5. Drug-Herb Interactions
6. Safety Warnings
7. Where to Source (BPOM approved)

Format as JSON:
{
  "herbs": [
    {
      "name": "...",
      "latinName": "...",
      "jamuName": "...",
      "compounds": ["..."],
      "gradeEvidence": "A|B|C|D",
      "dosage": "...",
      "preparation": "...",
      "durationWeeks": 4,
      "expectedResults": "...",
      "interactions": ["..."],
      "warnings": ["..."]
    }
  ],
  "bpomApproved": true,
  "disclaimer": "Not a substitute for medical advice"
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: responseText };

      await admin.firestore().collection('audit_logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId,
        action: 'herbal_advisor',
        condition,
        status: 'success'
      });

      res.json(analysis);
    } catch (error) {
      console.error('Herbal Advisor Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============ 6. HEALTH INSIGHT GENERATOR ============
export const healthInsight = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const { vitals, activities, sleep, userId } = req.body;

      if (!checkRateLimit(userId)) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      const prompt = `
You are a health AI for HerboraTech. Generate personalized health insights from vital signs.

Today's Vitals:
- Heart Rate: ${vitals.hr} bpm
- SpO2: ${vitals.spo2}%
- Temperature: ${vitals.temperature}°C
- Stress Level: ${vitals.stress}/100

Activities:
- Steps: ${activities.steps}
- Distance: ${activities.km} km
- Calories: ${activities.kcal}

Sleep:
- Duration: ${sleep.duration}h
- Quality: ${sleep.quality}

Generate:
1. Overall Health Status (good|fair|needs attention)
2. Key Observation
3. Positive Highlight
4. Area for Improvement
5. Today's Recommendation
6. 1 Tip for Tomorrow

Keep response concise and encouraging.

Format as JSON:
{
  "overallStatus": "good|fair|needs_attention",
  "keyObservation": "...",
  "highlight": "...",
  "improvement": "...",
  "todayRecommendation": "...",
  "tomorrowTip": "..."
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: responseText };

      res.json(analysis);
    } catch (error) {
      console.error('Health Insight Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============ 7. DISEASE RISK ASSESSMENT ============
export const riskAssessment = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const { userProfile, vitals, userId } = req.body;

      if (!checkRateLimit(userId)) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      const prompt = `
You are a risk assessment AI for HerboraTech. Assess health risks based on data.

Patient:
- Age: ${userProfile.age}, Gender: ${userProfile.gender}
- BMI: ${userProfile.bmi}
- Medical History: ${userProfile.medicalHistory?.join(', ') || 'None'}
- Family History: ${userProfile.familyHistory?.join(', ') || 'None'}

Current Vitals:
- HR: ${vitals.hr} bpm
- SpO2: ${vitals.spo2}%
- BP: ${vitals.bp || 'N/A'}
- Fasting Glucose: ${vitals.glucose || 'N/A'}

Assess risks for:
- Diabetes
- Hypertension
- Heart Disease
- Stroke
- Metabolic Syndrome

Format as JSON:
{
  "riskScores": {
    "disease": "score 0-100",
    "level": "low|medium|high",
    "reasoning": "..."
  },
  "keyRiskFactors": ["..."],
  "preventionStrategies": ["..."],
  "screeningRecommendations": ["..."]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: responseText };

      await admin.firestore().collection('audit_logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId,
        action: 'risk_assessment',
        status: 'success'
      });

      res.json(analysis);
    } catch (error) {
      console.error('Risk Assessment Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

console.log('✅ HerboraTech Gemini Cloud Functions initialized');
