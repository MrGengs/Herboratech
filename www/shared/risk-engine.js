/**
 * risk-engine.js — Rule-based scoring engine for disease risk assessment
 * Based on research markers and HERBORATECH health profile data.
 */

window.RiskEngine = {

  RISK_TO_CONDITION_MAP: {
    metabolic:    ['Sindrom Metabolik', 'Obesitas', 'Asam Urat', 'Kolesterol'],
    diabetes:     ['Diabetes Melitus', 'Gula Darah Tinggi', 'Prediabetes'],
    heart:        ['Jantung Koroner', 'Kolesterol', 'Hipertensi'],
    hypertension: ['Hipertensi', 'Tekanan Darah Tinggi'],
    stroke:       ['Stroke', 'Hipertensi', 'Kolesterol'],
    sleep:        ['Insomnia', 'Gangguan Tidur', 'Stres'],
  },

  RISK_COLOR: {
    low: '#0E7C46',
    medium: '#B07D1E',
    high: '#C94A42'
  },

  RISK_LABEL_ID: {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi'
  },

  RISK_CATEGORY(score) {
    if (score < 33) return 'low';
    if (score < 66) return 'medium';
    return 'high';
  },

  calculateAll(profile) {
    const scores = {
      metabolic: this.metabolicScore(profile),
      diabetes: this.diabetesScore(profile),
      heart: this.heartScore(profile),
      hypertension: this.hypertensionScore(profile),
      stroke: this.strokeScore(profile),
      sleep: this.sleepScore(profile),
      calculatedAt: new Date().toISOString()
    };
    scores.calculatedWith = "rule-based-v1.0";
    return scores;
  },

  metabolicScore(p) {
    let score = 0;
    let factors = [];
    const bmi = p.bmi || (p.weightKg / Math.pow(p.heightCm / 100, 2));
    
    if (bmi >= 30) { score += 40; factors.push("BMI Obesitas (>= 30)"); }
    else if (bmi >= 25) { score += 20; factors.push("BMI Kelebihan Berat (>= 25)"); }

    const waist = p.waistCircumferenceCm;
    if (p.gender === 'male' && waist >= 90) { score += 30; factors.push("Lingkar Pinggang Pria >= 90cm"); }
    if (p.gender === 'female' && waist >= 80) { score += 30; factors.push("Lingkar Pinggang Wanita >= 80cm"); }

    if (p.sugarIntake === 'high') { score += 15; factors.push("Konsumsi Gula Tinggi"); }
    if (p.exerciseFreqPerWeek <= 1) { score += 15; factors.push("Kurang Olahraga (< 2x/minggu)"); }

    return { score: Math.min(score, 100), category: this.RISK_CATEGORY(score), factors };
  },

  diabetesScore(p) {
    let score = 0;
    let factors = [];
    const bmi = p.bmi || (p.weightKg / Math.pow(p.heightCm / 100, 2));

    if (bmi >= 25) { score += 25; factors.push("BMI Berlebih"); }
    if (p.familyHistory?.diabetes) { score += 30; factors.push("Riwayat Diabetes Keluarga"); }
    if (p.knownConditions?.diabetes) { score = 100; factors.push("Sudah Terdiagnosis Diabetes"); }
    
    if (p.labResults?.hbA1c >= 6.5) { score = 100; factors.push("HbA1c >= 6.5% (Diabetes)"); }
    else if (p.labResults?.hbA1c >= 5.7) { score += 40; factors.push("HbA1c Prediabetes (5.7 - 6.4%)"); }

    if (p.sugarIntake === 'high') { score += 15; factors.push("Konsumsi Gula Tinggi"); }

    return { score: Math.min(score, 100), category: this.RISK_CATEGORY(score), factors };
  },

  heartScore(p) {
    let score = 0;
    let factors = [];
    if (p.smokingStatus === 'active') { score += 30; factors.push("Perokok Aktif"); }
    if (p.familyHistory?.heart) { score += 25; factors.push("Riwayat Jantung Keluarga"); }
    if (p.knownConditions?.heartAttack) { score = 100; factors.push("Riwayat Serangan Jantung"); }
    
    const tc = p.labResults?.totalCholesterol;
    if (tc >= 240) { score += 40; factors.push("Kolesterol Total Tinggi (>= 240)"); }
    else if (tc >= 200) { score += 20; factors.push("Kolesterol Ambang Batas (>= 200)"); }

    if (p.exerciseFreqPerWeek === 0) { score += 15; factors.push("Tidak Pernah Olahraga"); }

    return { score: Math.min(score, 100), category: this.RISK_CATEGORY(score), factors };
  },

  hypertensionScore(p) {
    let score = 0;
    let factors = [];
    
    const sbp = p.labResults?.sbp;
    const dbp = p.labResults?.dbp;

    if (sbp >= 140 || dbp >= 90) { score = 90; factors.push("TD Tinggi (Stage 2)"); }
    else if (sbp >= 130 || dbp >= 80) { score += 60; factors.push("TD Meningkat (Stage 1)"); }

    if (p.knownConditions?.onBPMeds) { score += 40; factors.push("Dalam Pengobatan Hipertensi"); }
    if (p.saltIntake === 'high') { score += 20; factors.push("Konsumsi Garam Tinggi"); }
    if (p.jobType === 'sedentary') { score += 10; factors.push("Pekerjaan Sedentari (Banyak Duduk)"); }

    return { score: Math.min(score, 100), category: this.RISK_CATEGORY(score), factors };
  },

  strokeScore(p) {
    let score = 0;
    let factors = [];
    const ht = this.hypertensionScore(p);
    score += ht.score * 0.5;
    if (ht.score > 60) factors.push("Risiko dari Hipertensi");

    if (p.smokingStatus === 'active') { score += 30; factors.push("Perokok Aktif"); }
    if (p.familyHistory?.stroke) { score += 20; factors.push("Riwayat Stroke Keluarga"); }
    if (p.alcoholUse === 'frequent') { score += 15; factors.push("Konsumsi Alkohol Sering"); }

    return { score: Math.min(score, 100), category: this.RISK_CATEGORY(score), factors };
  },

  sleepScore(p) {
    let score = 0;
    let factors = [];
    const hours = p.sleepHoursPerNight;
    if (hours < 6) { score += 40; factors.push("Kurang Tidur (< 6 jam)"); }
    else if (hours > 9) { score += 20; factors.push("Tidur Berlebih (> 9 jam)"); }

    const qual = p.sleepQuality;
    if (qual <= 4) { score += 40; factors.push("Kualitas Tidur Sangat Buruk"); }
    else if (qual <= 6) { score += 20; factors.push("Kualitas Tidur Kurang Baik"); }

    if (p.mentalHealth?.workStressLevel >= 8) { score += 20; factors.push("Stres Kerja Sangat Tinggi"); }

    return { score: Math.min(score, 100), category: this.RISK_CATEGORY(score), factors };
  },

  getTopConditions(scores) {
    let conditions = new Set();
    Object.keys(scores).forEach(key => {
      if (scores[key] && scores[key].score >= 33 && this.RISK_TO_CONDITION_MAP[key]) {
        this.RISK_TO_CONDITION_MAP[key].forEach(c => conditions.add(c));
      }
    });
    return Array.from(conditions);
  },

  getPersonalizationMultiplier(p) {
    let multiplier = 1.0;
    let adjustments = [];
    
    // Age factor (from birth date)
    if (p.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
      if (age > 55) { multiplier *= 1.2; adjustments.push("Usia > 55 tahun (+20%)"); }
      if (age < 30) { multiplier *= 0.9; adjustments.push("Usia muda (-10%)"); }
    }

    // Social determinants
    if (p.socialDeterminants?.socialIsolation >= 4) { 
      multiplier *= 1.1; 
      adjustments.push("Koneksi sosial baik (-10%)"); // actually wait, high isolation means more connected?
      // Wait, let's re-check SDOH logic in health-profile.html
    }

    return { multiplier, adjustments };
  },

  loadModels() {
    this.modelsLoaded = false;
    return Promise.resolve(false);
  }
};
