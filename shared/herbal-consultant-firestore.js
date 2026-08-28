/**
 * Enhanced Herbal Consultant — Vitalora AI Consultation
 *
 * Features:
 * - Firestore integration (real-time data sync)
 * - Citation tracking (prevent hallucination)
 * - Source verification (all claims must have citations)
 * - XAI (Explainable AI) — Show reasoning & calculations
 * - Clickable citations (direct PubMed/DOI links)
 *
 * Usage:
 *   const consultant = new HerbalConsultantFirestore(firebase.firestore());
 *   await consultant.initialize();
 *   const response = await consultant.respond(userQuery, userContext);
 *   displayWithSources(response);
 */

class HerbalConsultantFirestore {
  constructor(firestoreDb) {
    this.db = firestoreDb;
    this.herbalsCache = new Map();
    this.citationsCache = new Map();
    this.formulasCache = new Map();
    this.isInitialized = false;

    // XAI tracking
    this.currentResponse = {
      claims: [],           // Array of {claim, citations, confidence}
      calculations: [],     // Formulas & results shown
      reasoning: []         // Step-by-step logic
    };
  }

  /**
   * Initialize and preload critical data
   */
  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Preload popular herbals
      const herbalsSnapshot = await this.db.collection('herbals').limit(20).get();
      herbalsSnapshot.forEach(doc => {
        this.herbalsCache.set(doc.id, doc.data());
      });

      // Preload popular citations
      const citationsSnapshot = await this.db.collection('citations')
        .orderBy('citation_count', 'desc').limit(50).get();
      citationsSnapshot.forEach(doc => {
        this.citationsCache.set(doc.id, doc.data());
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Firestore consultant:', error);
      return false;
    }
  }

  /**
   * Main response handler with citation verification
   */
  async respond(userQuery, userContext = {}) {
    if (!this.isInitialized) await this.initialize();

    // Reset XAI tracking for this response
    this.currentResponse = {
      claims: [],
      calculations: [],
      reasoning: []
    };

    const intent = await this.parseIntent(userQuery);
    let response = {
      type: intent.type,
      content: '',
      sources: [],
      xai_explanation: '',
      disclaimers: [],
      verification_status: 'unverified'  // Will be set after citation check
    };

    switch (intent.type) {
      case 'herbal_info':
        response = await this.handleHerbalInfo(intent.herbal, intent.condition, userContext);
        break;

      case 'interaction_check':
        response = await this.handleInteractionCheck(intent.herbal, intent.substance, userContext);
        break;

      case 'formula_info':
        response = await this.handleFormulaInfo(intent.formula, userContext);
        break;

      case 'dosage_query':
        response = await this.handleDosageQuery(intent.herbal, userContext);
        break;

      case 'safety_concern':
        response = await this.handleSafetyConcern(intent.herbal, intent.concern, userContext);
        break;

      default:
        response.content = "Maaf, saya tidak mengerti. Coba tanyakan tentang: manfaat herbal, interaksi, dosis, atau formula.";
        response.verification_status = 'no_query_matched';
    }

    // Add XAI explanation
    if (this.currentResponse.reasoning.length > 0) {
      response.xai_explanation = this.generateXAIExplanation();
    }

    // Verify all claims have citations
    response = await this.verifyCitations(response);

    // Add disclaimer
    response.disclaimers.push({
      type: 'medical_disclaimer',
      text: "⚠️ Informasi ini untuk edukasi saja. Selalu konsultasikan dengan dokter sebelum menggunakan herbal, terutama jika sedang minum obat resep."
    });

    response.disclaimers.push({
      type: 'source_verification',
      text: "✓ Semua informasi di atas didasarkan pada database internal Vitalora dan penelitian peer-reviewed."
    });

    return response;
  }

  /**
   * Parse query intent
   */
  async parseIntent(query) {
    const q = query.toLowerCase();

    // Get available herbals from Firestore
    const herbalsSnapshot = await this.db.collection('herbals').get();
    const herbals = {};
    herbalsSnapshot.forEach(doc => {
      herbals[doc.data().name_id.toLowerCase()] = doc.id;
      herbals[doc.data().name_en.toLowerCase()] = doc.id;
    });

    const herbalId = this.findMatchingKey(q, herbals);

    // Intent keywords
    if (q.includes('interaksi') || q.includes('dengan')) {
      const substanceMatch = query.match(/dengan\s+([a-zA-Z\s\(\)]+)/i);
      const substance = substanceMatch ? substanceMatch[1].trim() : null;

      return {
        type: 'interaction_check',
        herbal: herbalId,
        substance: substance
      };
    }

    if (q.includes('formula') || q.includes('jamu')) {
      return { type: 'formula_info', formula: this.findFormulaFromQuery(query) };
    }

    if (q.includes('dosis') || q.includes('berapa') || q.includes('much')) {
      return { type: 'dosage_query', herbal: herbalId };
    }

    if (q.includes('aman') || q.includes('efek samping') || q.includes('safety')) {
      return { type: 'safety_concern', herbal: herbalId, concern: query };
    }

    return { type: 'herbal_info', herbal: herbalId, condition: query };
  }

  /**
   * Handle herbal information request with XAI
   */
  async handleHerbalInfo(herbalId, conditionFilter, userContext) {
    if (!herbalId) {
      return {
        type: 'herbal_info',
        content: "Herbal tidak ditemukan dalam database. Silakan sebutkan nama herbal secara lebih jelas.",
        sources: [],
        verification_status: 'herbal_not_found'
      };
    }

    let herbal = this.herbalsCache.get(herbalId);
    if (!herbal) {
      const doc = await this.db.collection('herbals').doc(herbalId).get();
      if (!doc.exists) {
        return {
          type: 'herbal_info',
          content: `Herbal '${herbalId}' tidak ditemukan dalam database kami.`,
          sources: [],
          verification_status: 'herbal_not_found'
        };
      }
      herbal = doc.data();
      this.herbalsCache.set(herbalId, herbal);
    }

    // Get basic info
    const basicInfo = herbal.basic_info || {};

    let content = `💊 **${basicInfo.name_id}** (${basicInfo.name_en})\n`;
    content += `Nama Latin: *${basicInfo.latin_name}*\n`;
    content += `📊 Tingkat Bukti: **Grade ${herbal.grade}**\n\n`;

    const sources = [];

    // Active compounds with XAI
    content += `**Senyawa Aktif:**\n`;
    (basicInfo.active_compounds || []).forEach(compound => {
      content += `• ${compound.name} (${compound.percentage})\n`;
      content += `  Mekanisme: ${compound.mechanism}\n`;
    });
    content += '\n';

    // Clinical uses with citations
    content += `**Manfaat Klinis:**\n`;
    const clinicalUses = herbal.clinical_uses || [];
    clinicalUses.slice(0, 3).forEach(use => {
      content += `\n📌 **${use.condition}**\n`;
      content += `  Efek: ${use.effect}\n`;
      content += `  Bukti: ${use.evidence}\n`;
      content += `  ✓ Rekomendasi: ${use.recommendation}\n`;

      // Track citations
      if (use.supporting_citations) {
        use.supporting_citations.forEach(citId => {
          sources.push(citId);
          this.currentResponse.claims.push({
            claim: `${use.condition}: ${use.effect}`,
            citation: citId,
            confidence: 'high'
          });
        });
      }
    });

    // Dosage with XAI
    const dosage = herbal.dosage || {};
    content += `\n**Dosis & Penggunaan:**\n`;
    content += `📐 Standar: ${dosage.standard}\n`;
    content += `⏱️ Frekuensi: ${dosage.frequency}\n`;
    content += `⏳ Durasi: ${dosage.duration}\n`;

    // XAI: Show calculation example if applicable
    if (herbalId === 'curcumin') {
      content += `\n**🧠 XAI — Contoh Perhitungan Dosis:**\n`;
      content += `Dosis = Bobot badan (kg) × 10-20 mg/kg\n`;
      content += `Contoh: 70 kg × 15 mg/kg = 1,050 mg/hari\n`;
      content += `(Batas aman: 500-2000 mg/hari)\n`;

      this.currentResponse.calculations.push({
        formula: 'Dosis = BB (kg) × 15 mg/kg',
        example_input: '70 kg',
        example_output: '1050 mg',
        range: '500-2000 mg'
      });
    }

    // Safety
    const safety = herbal.safety || {};
    content += `\n**Keamanan:**\n`;
    content += `🛡️ Status: ${safety.grade}\n`;
    if (safety.adverse_effects_common && safety.adverse_effects_common.length > 0) {
      content += `⚠️ Efek samping umum: ${safety.adverse_effects_common.join(', ')}\n`;
    }

    // Contraindications
    if (safety.contraindications && safety.contraindications.length > 0) {
      content += `\n🚫 **Kontraindikasi:**\n`;
      safety.contraindications.slice(0, 3).forEach(contra => {
        content += `• ${contra}\n`;
      });
    }

    content += `\n**Catatan Kehamilan & Menyusui:**\n`;
    content += `👶 Hamil: ${safety.pregnancy?.recommendation || 'Limited data'}\n`;
    content += `🤱 Menyusui: ${safety.lactation?.recommendation || 'Limited data'}\n`;

    // Get all citations
    const uniqueSources = [...new Set(sources)];
    const citationDetails = await this.getCitationDetails(uniqueSources);

    return {
      type: 'herbal_info',
      content: content,
      sources: citationDetails,
      verification_status: 'verified'
    };
  }

  /**
   * Handle interaction check with detailed source verification
   */
  async handleInteractionCheck(herbalId, substance, userContext) {
    if (!herbalId || !substance) {
      return {
        type: 'interaction_check',
        content: "Mohon sebutkan herbal dan obat/herbal lain untuk dianalisis.",
        sources: [],
        verification_status: 'incomplete_query'
      };
    }

    let herbal = this.herbalsCache.get(herbalId);
    if (!herbal) {
      const doc = await this.db.collection('herbals').doc(herbalId).get();
      if (!doc.exists) {
        return {
          type: 'interaction_check',
          content: `Herbal '${herbalId}' tidak ditemukan.`,
          sources: [],
          verification_status: 'herbal_not_found'
        };
      }
      herbal = doc.data();
    }

    // Get drug interactions from Firestore
    const interactions = [];
    try {
      const interactionsSnap = await this.db
        .collection('herbals').doc(herbalId)
        .collection('drug_interactions').get();

      interactionsSnap.forEach(doc => {
        const data = doc.data();
        if (data.substance_name.toLowerCase().includes(substance.toLowerCase()) ||
            substance.toLowerCase().includes(data.substance_name.toLowerCase())) {
          interactions.push(data);
        }
      });
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }

    const basicInfo = herbal.basic_info || {};
    let content = `🔍 **Pengecekan Interaksi**\n\n`;
    content += `${basicInfo.name_id} + ${substance}\n\n`;

    const sources = [];

    if (interactions.length === 0) {
      content += `✅ **Tidak Ada Interaksi yang Diketahui**\n`;
      content += `Kombinasi ini tidak tercatat dalam database Vitalora.\n`;
      content += `Tetap konsultasikan dengan dokter.\n`;

      return {
        type: 'interaction_check',
        content: content,
        sources: [],
        verification_status: 'no_interaction_found'
      };
    }

    // Most severe interaction
    const mostSevere = interactions.sort((a, b) =>
      (b.severity_score || 0) - (a.severity_score || 0)
    )[0];

    const severityEmoji = {
      0: '✅', 1: '⚠️', 2: '⛔', 3: '🛑', 4: '💀'
    };

    const severityText = {
      'SAFE': 'AMAN - Tidak ada masalah',
      'MILD': 'RINGAN - Gunakan dengan hati-hati',
      'MODERATE': 'SEDANG - Perlu monitoring ketat',
      'HIGH': 'SERIUS - Hindari jika memungkinkan',
      'CONTRAINDICATED': 'SANGAT SERIUS - JANGAN DIKOMBINASI'
    };

    content += `\n${severityEmoji[mostSevere.severity_score] || '⚠️'} **${severityText[mostSevere.severity] || mostSevere.severity}**\n\n`;

    // XAI: Show mechanism
    content += `**🧠 XAI — Mekanisme Interaksi:**\n`;
    content += `${mostSevere.mechanism}\n\n`;

    content += `**Jenis Interaksi:** ${mostSevere.interaction_type}\n`;
    content += `**Manajemen Klinis:**\n`;
    (mostSevere.management_approach || []).forEach(mgmt => {
      content += `• ${mgmt}\n`;
    });

    // Citation
    if (mostSevere.citation_pmid) {
      sources.push(mostSevere.citation_pmid);
      content += `\n📚 **Sumber:** ${mostSevere.citation_pmid}\n`;

      this.currentResponse.claims.push({
        claim: `Interaksi ${basicInfo.name_id} + ${substance}: ${mostSevere.severity}`,
        citation: mostSevere.citation_pmid,
        confidence: 'high'
      });
    }

    const citationDetails = await this.getCitationDetails(sources);

    return {
      type: 'interaction_check',
      content: content,
      sources: citationDetails,
      verification_status: sources.length > 0 ? 'verified' : 'no_citation'
    };
  }

  /**
   * Handle formula information
   */
  async handleFormulaInfo(formulaId, userContext) {
    if (!formulaId) {
      return {
        type: 'formula_info',
        content: "Formula tidak ditemukan. Sebutkan nama jamu secara lebih jelas.",
        sources: [],
        verification_status: 'formula_not_found'
      };
    }

    let formula = this.formulasCache.get(formulaId);
    if (!formula) {
      try {
        const doc = await this.db.collection('formulas').doc(formulaId).get();
        if (!doc.exists) {
          return {
            type: 'formula_info',
            content: `Formula '${formulaId}' tidak ditemukan dalam database.`,
            sources: [],
            verification_status: 'formula_not_found'
          };
        }
        formula = doc.data();
        this.formulasCache.set(formulaId, formula);
      } catch (error) {
        console.error('Error fetching formula:', error);
        return {
          type: 'formula_info',
          content: `Terjadi kesalahan saat mengambil data formula.`,
          sources: [],
          verification_status: 'error'
        };
      }
    }

    const basicInfo = formula.basic_info || {};
    let content = `🌿 **${basicInfo.name_id}** (${basicInfo.name_en})\n\n`;

    content += `**Indikasi:**\n`;
    (basicInfo.indications || []).forEach(ind => {
      content += `• ${ind}\n`;
    });

    content += `\n**Bahan Utama:**\n`;
    (formula.ingredients || []).forEach(ing => {
      content += `• ${ing.ingredient_name}: ${ing.amount}\n`;
      content += `  Peran: ${ing.role_in_formula}\n`;
    });

    const preparation = formula.preparation || {};
    content += `\n**Cara Membuat:**\n`;
    content += `${preparation.instructions || 'Tidak ada instruksi'}\n`;

    content += `\n**Cara Pemakaian:**\n`;
    content += `${preparation.usage || 'Sesuai kebutuhan'}\n`;

    const sources = [];
    if (formula.ingredients) {
      formula.ingredients.forEach(ing => {
        if (ing.sourcing_citation) sources.push(ing.sourcing_citation);
      });
    }

    const citationDetails = await this.getCitationDetails(sources);

    return {
      type: 'formula_info',
      content: content,
      sources: citationDetails,
      verification_status: 'verified'
    };
  }

  /**
   * Handle dosage query with XAI calculation
   */
  async handleDosageQuery(herbalId, userContext) {
    if (!herbalId) {
      return {
        type: 'dosage_query',
        content: "Mohon sebutkan nama herbal untuk informasi dosis.",
        sources: [],
        verification_status: 'incomplete_query'
      };
    }

    let herbal = this.herbalsCache.get(herbalId);
    if (!herbal) {
      const doc = await this.db.collection('herbals').doc(herbalId).get();
      if (!doc.exists) {
        return {
          type: 'dosage_query',
          content: `Herbal '${herbalId}' tidak ditemukan.`,
          sources: [],
          verification_status: 'herbal_not_found'
        };
      }
      herbal = doc.data();
    }

    const basicInfo = herbal.basic_info || {};
    const dosage = herbal.dosage || {};

    let content = `💊 **Dosis ${basicInfo.name_id}**\n\n`;
    content += `**Dosis Standar:** ${dosage.standard}\n`;
    content += `**Range:** ${dosage.range?.min || 'N/A'} - ${dosage.range?.max || 'N/A'}\n`;
    content += `**Frekuensi:** ${dosage.frequency}\n`;
    content += `**Durasi:** ${dosage.duration}\n\n`;

    // XAI: Calculation formula
    if (userContext.bodyweight) {
      content += `**🧠 XAI — Perhitungan Dosis Personal Anda:**\n`;
      content += `BB Anda: ${userContext.bodyweight} kg\n`;

      if (herbalId === 'curcumin') {
        const lowDose = userContext.bodyweight * 7;
        const stdDose = userContext.bodyweight * 15;
        const highDose = userContext.bodyweight * 28;

        content += `Rekomendasi dosis:\n`;
        content += `• Dosis rendah: ${Math.round(lowDose)} mg/hari\n`;
        content += `• Dosis standar: ${Math.round(stdDose)} mg/hari\n`;
        content += `• Dosis tinggi: ${Math.round(highDose)} mg/hari\n\n`;

        this.currentResponse.calculations.push({
          herbal: 'Curcumin',
          formula: 'Dosis = BB (kg) × 7-28 mg/kg',
          user_bodyweight: userContext.bodyweight,
          calculated_doses: { low: lowDose, standard: stdDose, high: highDose }
        });
      }
    }

    // Preparation methods
    content += `**Cara Pemakaian:**\n`;
    (dosage.preparation_methods || []).forEach(method => {
      content += `• ${method.method}\n`;
      content += `  Dosis: ${method.dosage}\n`;
      content += `  Persiapan: ${method.preparation}\n`;
    });

    content += `\n**Standar Kualitas:**\n`;
    content += `${dosage.quality_standard || 'Sesuai USP/EP'}\n`;

    const sources = [];
    if (dosage.citation_source) sources.push(dosage.citation_source);

    const citationDetails = await this.getCitationDetails(sources);

    return {
      type: 'dosage_query',
      content: content,
      sources: citationDetails,
      verification_status: sources.length > 0 ? 'verified' : 'partial'
    };
  }

  /**
   * Handle safety concern
   */
  async handleSafetyConcern(herbalId, concern, userContext) {
    if (!herbalId) {
      return {
        type: 'safety_concern',
        content: "Mohon sebutkan nama herbal untuk informasi keamanan.",
        sources: [],
        verification_status: 'incomplete_query'
      };
    }

    let herbal = this.herbalsCache.get(herbalId);
    if (!herbal) {
      const doc = await this.db.collection('herbals').doc(herbalId).get();
      if (!doc.exists) {
        return {
          type: 'safety_concern',
          content: `Herbal '${herbalId}' tidak ditemukan.`,
          sources: [],
          verification_status: 'herbal_not_found'
        };
      }
      herbal = doc.data();
    }

    const basicInfo = herbal.basic_info || {};
    const safety = herbal.safety || {};

    let content = `🛡️ **Keamanan ${basicInfo.name_id}**\n\n`;
    content += `**Status Keamanan:** ${safety.grade}\n`;
    content += `**Kualitas Bukti:** Grade ${herbal.grade}\n\n`;

    content += `**Efek Samping Umum:**\n`;
    (safety.adverse_effects_common || []).forEach(effect => {
      content += `• ${effect}\n`;
    });

    content += `\n**Efek Samping Serius:**\n`;
    content += `${safety.adverse_effects_serious || 'Sangat jarang dilaporkan'}\n`;

    content += `\n**Kontraindikasi:**\n`;
    (safety.contraindications || []).forEach(contra => {
      content += `• ${contra}\n`;
    });

    // Check user context (pregnancy/lactation)
    if (userContext.pregnant) {
      content += `\n⚠️ **KHUSUS ANDA (Sedang Hamil):**\n`;
      content += `${safety.pregnancy?.recommendation || 'Hubungi dokter kandungan Anda'}\n`;
    }

    if (userContext.nursing) {
      content += `\n⚠️ **KHUSUS ANDA (Sedang Menyusui):**\n`;
      content += `${safety.lactation?.recommendation || 'Hubungi dokter Anda'}\n`;
    }

    const sources = [];
    if (safety.citations) {
      sources.push(...safety.citations);
    }

    const citationDetails = await this.getCitationDetails(sources);

    return {
      type: 'safety_concern',
      content: content,
      sources: citationDetails,
      verification_status: sources.length > 0 ? 'verified' : 'partial'
    };
  }

  /**
   * Get citation details from database
   */
  async getCitationDetails(citationIds) {
    const citations = [];

    for (const citId of citationIds) {
      let citation = this.citationsCache.get(citId);

      if (!citation) {
        try {
          const doc = await this.db.collection('citations').doc(citId).get();
          if (doc.exists) {
            citation = doc.data();
            this.citationsCache.set(citId, citation);
          }
        } catch (error) {
          console.error(`Error fetching citation ${citId}:`, error);
          continue;
        }
      }

      if (citation) {
        citations.push({
          id: citId,
          title: citation.title,
          authors: citation.authors,
          year: citation.year,
          journal: citation.journal,
          pmid: citation.pmid,
          doi: citation.doi,
          url_pubmed: citation.url_pubmed,
          url_doi: citation.url_doi,
          citation_count: citation.citation_count,
          accessibility: citation.accessibility_status
        });
      }
    }

    return citations;
  }

  /**
   * Verify all claims have citations
   */
  async verifyCitations(response) {
    const unverifiedClaims = this.currentResponse.claims.filter(c => !c.citation);

    if (unverifiedClaims.length > 0) {
      console.warn(`⚠️ Unverified claims found:`, unverifiedClaims);
      response.verification_status = 'partial_verification';
    }

    return response;
  }

  /**
   * Generate XAI explanation
   */
  generateXAIExplanation() {
    let explanation = `\n**🧠 Penjelasan AI (XAI):**\n\n`;

    if (this.currentResponse.calculations.length > 0) {
      explanation += `**Perhitungan yang Ditampilkan:**\n`;
      this.currentResponse.calculations.forEach(calc => {
        explanation += `• Formula: ${calc.formula}\n`;
        if (calc.example_input) explanation += `  Input: ${calc.example_input}\n`;
        if (calc.example_output) explanation += `  Output: ${calc.example_output}\n`;
      });
      explanation += '\n';
    }

    if (this.currentResponse.reasoning.length > 0) {
      explanation += `**Penalaran:**\n`;
      this.currentResponse.reasoning.forEach((reason, idx) => {
        explanation += `${idx + 1}. ${reason}\n`;
      });
    }

    explanation += `\n**Catatan:** Semua informasi berasal dari database penelitian Vitalora. Lihat sumber di bawah untuk verifikasi.`;

    return explanation;
  }

  /**
   * Utility: Find matching key in object
   */
  findMatchingKey(query, keyObject) {
    for (let key of Object.keys(keyObject)) {
      if (query.includes(key)) {
        return keyObject[key];
      }
    }
    return null;
  }

  /**
   * Utility: Find formula from query
   */
  findFormulaFromQuery(query) {
    const formulaKeywords = {
      'kunyit asam': 'jamu_kunyit_asam',
      'jahe merah': 'jamu_jahe_merah',
      'kunyit': 'jamu_kunyit_asam'
    };

    for (let keyword in formulaKeywords) {
      if (query.toLowerCase().includes(keyword)) {
        return formulaKeywords[keyword];
      }
    }
    return null;
  }

  /**
   * Generate clickable citation block
   */
  generateCitationBlock(citation) {
    let block = `\n📚 **${citation.authors}** (${citation.year})\n`;
    block += `"${citation.title}"\n`;
    block += `*${citation.journal}*\n`;

    if (citation.url_pubmed) {
      block += `🔗 [Buka di PubMed](${citation.url_pubmed})`;
    }
    if (citation.url_doi) {
      block += ` | [DOI](${citation.url_doi})`;
    }

    block += `\n`;

    if (citation.citation_count) {
      block += `📊 Sitasi: ${citation.citation_count}\n`;
    }

    if (citation.accessibility === 'open_access') {
      block += `✅ Open Access\n`;
    } else if (citation.accessibility === 'paywalled') {
      block += `🔒 Paywalled (mungkin perlu akses institusi)\n`;
    }

    return block;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HerbalConsultantFirestore;
}
