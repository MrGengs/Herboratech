/**
 * Herbal Consultant Module — Vitalora AI Assistant
 * Provides standardized herbal knowledge for "Info Obat & Interaksi" feature
 *
 * Usage:
 *   const consultant = new HerbalConsultant();
 *   consultant.initialize().then(() => {
 *     const info = consultant.queryHerbal('curcumin');
 *     const interaction = consultant.checkInteraction('curcumin', 'warfarin');
 *     consultant.respond('userQuery', context);
 *   });
 */

class HerbalConsultant {
  constructor() {
    this.knowledgeBase = null;
    this.herbIndex = {}; // Fast lookup
    this.isInitialized = false;
  }

  /**
   * Initialize and load knowledge base
   */
  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Load JSON data from Firestore or local
      const response = await fetch('/herbal-knowledge-base.json');
      if (!response.ok) {
        console.warn('Local JSON not found, using embedded data');
        this.knowledgeBase = this.getEmbeddedData();
      } else {
        this.knowledgeBase = await response.json();
      }

      // Build index for fast lookup
      this.knowledgeBase.herbals.forEach((herbal, idx) => {
        this.herbIndex[herbal.id] = idx;
        this.herbIndex[herbal.name_id.toLowerCase()] = idx;
        this.herbIndex[herbal.name_en.toLowerCase()] = idx;
        herbal.latin_name.split('/').forEach(name => {
          this.herbIndex[name.toLowerCase().trim()] = idx;
        });
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize HerbalConsultant:', error);
      return false;
    }
  }

  /**
   * Find herbal by name (flexible matching)
   */
  findHerbal(query) {
    const normalizedQuery = query.toLowerCase().trim();

    // Exact match first
    if (this.herbIndex[normalizedQuery] !== undefined) {
      const idx = this.herbIndex[normalizedQuery];
      return this.knowledgeBase.herbals[idx];
    }

    // Partial match
    for (let herbal of this.knowledgeBase.herbals) {
      if (herbal.name_id.toLowerCase().includes(normalizedQuery) ||
          herbal.name_en.toLowerCase().includes(normalizedQuery) ||
          herbal.latin_name.toLowerCase().includes(normalizedQuery)) {
        return herbal;
      }
    }

    return null;
  }

  /**
   * Get herbal information (clinical uses, dosage, safety)
   */
  queryHerbal(herbalName, conditionFilter = null) {
    const herbal = this.findHerbal(herbalName);
    if (!herbal) return null;

    const result = {
      id: herbal.id,
      name_id: herbal.name_id,
      name_en: herbal.name_en,
      grade: herbal.grade,
      grade_justification: herbal.grade_justification,
      active_compounds: herbal.active_compounds,
      dosage: herbal.dosage,
      safety: herbal.safety_profile,
      contraindications: herbal.contraindications
    };

    // Filter clinical uses by condition if provided
    if (conditionFilter) {
      result.clinical_uses = herbal.clinical_uses.filter(use =>
        use.condition.toLowerCase().includes(conditionFilter.toLowerCase())
      );
    } else {
      result.clinical_uses = herbal.clinical_uses;
    }

    return result;
  }

  /**
   * Check interaction between herbal and drug/herbal
   * Returns: { hasInteraction, severity, recommendation, reference }
   */
  checkInteraction(herbalName, substanceName, type = 'drug') {
    const herbal = this.findHerbal(herbalName);
    if (!herbal) return { error: 'Herbal not found', hasInteraction: false };

    const normalizedQuery = substanceName.toLowerCase().trim();
    let interactions = [];

    if (type === 'drug' || type === 'auto') {
      // Check drug interactions
      const drugInteractions = herbal.drug_interactions.filter(interaction =>
        interaction.drug.toLowerCase().includes(normalizedQuery) ||
        normalizedQuery.includes(interaction.drug.toLowerCase())
      );
      interactions.push(...drugInteractions);
    }

    if (type === 'herbal' || type === 'auto') {
      // Check herbal interactions
      const herbalInteractions = herbal.herbal_interactions.filter(interaction =>
        interaction.herbal.toLowerCase().includes(normalizedQuery) ||
        normalizedQuery.includes(interaction.herbal.toLowerCase())
      );
      interactions.push(...herbalInteractions);
    }

    if (interactions.length === 0) {
      return {
        hasInteraction: false,
        message: `Tidak ada interaksi yang diketahui antara ${herbal.name_id} dan ${substanceName}`,
        note: 'Tetap konsultasikan dengan dokter jika ingin mengombinasikan'
      };
    }

    // Return the most severe interaction
    const severityRank = { 'SAFE': 0, 'MILD': 1, 'MODERATE': 2, 'HIGH': 3, 'CONTRAINDICATED': 4 };
    const mostSevere = interactions.sort((a, b) =>
      (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0)
    )[0];

    return {
      hasInteraction: true,
      interaction: mostSevere,
      allInteractions: interactions,
      severity: mostSevere.severity,
      recommendation: mostSevere.recommendation
    };
  }

  /**
   * Generate AI response for herbal query
   */
  async respond(userQuery, context = {}) {
    if (!this.isInitialized) await this.initialize();

    // Parse query intent
    const intent = this.parseQueryIntent(userQuery);

    let response = {
      type: intent.type,
      content: '',
      sources: []
    };

    switch (intent.type) {
      case 'info_request':
        response = this.handleInfoRequest(intent.herbal, intent.condition);
        break;

      case 'interaction_check':
        response = this.handleInteractionCheck(intent.herbal, intent.substance);
        break;

      case 'dosage_query':
        response = this.handleDosageQuery(intent.herbal);
        break;

      case 'safety_concern':
        response = this.handleSafetyConcern(intent.herbal, intent.concern);
        break;

      case 'combination_query':
        response = this.handleCombinationQuery(intent.herbals);
        break;

      default:
        response.content = "Maaf, saya tidak mengerti pertanyaan Anda. Coba tanyakan tentang: manfaat herbal, dosis, interaksi, atau keamanan.";
    }

    // Add disclaimer
    response.disclaimer = "⚠️ Informasi ini untuk edukasi. Konsultasikan dengan dokter sebelum memulai suplemen herbal, terutama jika sedang minum obat resep.";

    return response;
  }

  /**
   * Parse user query intent
   */
  parseQueryIntent(query) {
    const q = query.toLowerCase();

    // Extract herbal names
    const herbals = this.knowledgeBase.herbals
      .filter(h => q.includes(h.name_id.toLowerCase()) || q.includes(h.name_en.toLowerCase()))
      .map(h => h.id);

    const herbal = herbals.length > 0 ? herbals[0] : null;

    // Detect intent keywords
    if (q.includes('interaksi') || q.includes('interaction') || q.includes('obat') || q.includes('obat minum')) {
      // Extract drug/substance name
      const substanceMatch = query.match(/dengan\s+([a-zA-Z\s]+)/i);
      const substance = substanceMatch ? substanceMatch[1].trim() : null;

      return {
        type: 'interaction_check',
        herbal: herbal,
        substance: substance
      };
    }

    if (q.includes('dosis') || q.includes('berapa') || q.includes('dosage') || q.includes('how much')) {
      return {
        type: 'dosage_query',
        herbal: herbal
      };
    }

    if (q.includes('aman') || q.includes('efek samping') || q.includes('safety') || q.includes('side effects')) {
      return {
        type: 'safety_concern',
        herbal: herbal,
        concern: query
      };
    }

    if (q.includes('kombinasi') || q.includes('campuran') || q.includes('bersama') || q.includes('combine')) {
      return {
        type: 'combination_query',
        herbals: herbals
      };
    }

    // Default: information request
    return {
      type: 'info_request',
      herbal: herbal,
      condition: query
    };
  }

  /**
   * Handle: "Apa manfaat kunyit?" / "Untuk penyakit apa ginger?"
   */
  handleInfoRequest(herbalId, conditionFilter) {
    const herbal = this.knowledgeBase.herbals.find(h => h.id === herbalId);

    if (!herbal) {
      return {
        type: 'info_request',
        content: "Maaf, herbal tidak ditemukan dalam database. Coba nama lain."
      };
    }

    let content = `💊 ${herbal.name_id} (${herbal.name_en})\n`;
    content += `Nama Latin: ${herbal.latin_name}\n`;
    content += `📊 Tingkat Bukti: Grade ${herbal.grade}\n\n`;

    content += `**Manfaat Klinis:**\n`;
    herbal.clinical_uses.slice(0, 3).forEach(use => {
      content += `\n• **${use.condition}**\n`;
      content += `  Efek: ${use.effect}\n`;
      content += `  Bukti: ${use.evidence}\n`;
      content += `  Rekomendasi: ${use.recommendation}`;
    });

    content += `\n\n**Dosis Standar:** ${herbal.dosage.standard}\n`;
    content += `Frekuensi: ${herbal.dosage.frequency}\n`;
    content += `Durasi: ${herbal.dosage.duration}\n`;

    content += `\n**Keamanan:** ${herbal.safety_profile.grade}\n`;
    if (herbal.safety_profile.adverse_effects_common.length > 0) {
      content += `Efek samping umum: ${herbal.safety_profile.adverse_effects_common.join(', ')}\n`;
    }

    content += `\n**Kontradikasi:**\n`;
    herbal.contraindications.slice(0, 3).forEach(contra => {
      content += `• ${contra}\n`;
    });

    return {
      type: 'info_request',
      content: content,
      sources: herbal.clinical_evidence.landmark_studies
    };
  }

  /**
   * Handle: "Aman tidak kunyit dengan warfarin?" / "Bisa dikombinasi ginger + aspirin?"
   */
  handleInteractionCheck(herbalId, substance) {
    const herbal = this.knowledgeBase.herbals.find(h => h.id === herbalId);

    if (!herbal) {
      return {
        type: 'interaction_check',
        content: "Herbal tidak ditemukan dalam database."
      };
    }

    if (!substance) {
      return {
        type: 'interaction_check',
        content: `Untuk cek interaksi, sebutkan nama obat atau herbal. Contoh: "Aman tidak ${herbal.name_id} dengan warfarin?"`
      };
    }

    const result = this.checkInteraction(herbal.name_id, substance, 'auto');

    let content = `🔍 **Pengecekan Interaksi**\n\n`;
    content += `${herbal.name_id} + ${substance}\n`;

    if (!result.hasInteraction) {
      content += `\n✅ **Tidak Ada Interaksi yang Diketahui**\n`;
      content += `${result.message}\n`;
      content += `${result.note}`;
    } else {
      const severityEmoji = {
        'SAFE': '✅',
        'MILD': '⚠️',
        'MODERATE': '⛔',
        'HIGH': '🛑',
        'CONTRAINDICATED': '💀'
      };

      const severityText = {
        'SAFE': 'AMAN - Tidak ada masalah',
        'MILD': 'RINGAN - Gunakan dengan hati-hati',
        'MODERATE': 'SEDANG - Perlu monitoring ketat',
        'HIGH': 'SERIUS - Hindari jika memungkinkan',
        'CONTRAINDICATED': 'SANGAT SERIUS - JANGAN DIKOMBINASI'
      };

      content += `\n${severityEmoji[result.severity] || '⚠️'} **${severityText[result.severity] || result.severity}**\n\n`;
      content += `**Jenis Interaksi:** ${result.interaction.type}\n`;
      content += `**Rekomendasi:** ${result.interaction.recommendation}\n`;

      if (result.interaction.reference) {
        content += `**Referensi:** ${result.interaction.reference}\n`;
      }

      if (result.allInteractions.length > 1) {
        content += `\n**Catatan:** Ada ${result.allInteractions.length} interaksi yang ditemukan. Hubungi dokter untuk penilaian menyeluruh.`;
      }
    }

    return {
      type: 'interaction_check',
      content: content,
      severity: result.severity
    };
  }

  /**
   * Handle: "Berapa dosis kunyit?" / "Dosis ginger untuk diabetes?"
   */
  handleDosageQuery(herbalId) {
    const herbal = this.knowledgeBase.herbals.find(h => h.id === herbalId);

    if (!herbal) {
      return {
        type: 'dosage_query',
        content: "Herbal tidak ditemukan dalam database."
      };
    }

    let content = `💊 **Dosis ${herbal.name_id}**\n\n`;

    content += `**Dosis Standar:** ${herbal.dosage.standard}\n`;
    content += `**Range:** ${herbal.dosage.range_min} - ${herbal.dosage.range_max}\n`;
    content += `**Frekuensi:** ${herbal.dosage.frequency}\n`;
    content += `**Durasi Penggunaan:** ${herbal.dosage.duration}\n\n`;

    if (herbal.dosage.notes) {
      content += `**Catatan Penting:** ${herbal.dosage.notes}\n\n`;
    }

    content += `**Cara Penyimpanan:** ${herbal.storage_stability.stability}\n`;
    content += `Kondisi: ${herbal.storage_stability.storage_condition || 'Tempat sejuk dan kering'}\n`;

    return {
      type: 'dosage_query',
      content: content
    };
  }

  /**
   * Handle: "Aman tidak kunyit untuk ibu hamil?" / "Efek samping ginger apa?"
   */
  handleSafetyConcern(herbalId, concern) {
    const herbal = this.knowledgeBase.herbals.find(h => h.id === herbalId);

    if (!herbal) {
      return {
        type: 'safety_concern',
        content: "Herbal tidak ditemukan dalam database."
      };
    }

    let content = `🛡️ **Keamanan ${herbal.name_id}**\n\n`;

    content += `**Tingkat Keamanan:** ${herbal.safety_profile.grade}\n`;
    content += `**Kualitas Bukti:** Grade ${herbal.grade}\n\n`;

    content += `**Efek Samping Umum:**\n`;
    if (herbal.safety_profile.adverse_effects_common.length > 0) {
      herbal.safety_profile.adverse_effects_common.forEach(effect => {
        content += `• ${effect}\n`;
      });
    } else {
      content += `• Minimal atau tidak ada dilaporkan\n`;
    }

    content += `\n**Efek Samping Serius (Jarang):**\n`;
    if (herbal.safety_profile.adverse_effects_serious && herbal.safety_profile.adverse_effects_serious !== 'Rare') {
      content += `• ${herbal.safety_profile.adverse_effects_serious}\n`;
    } else {
      content += `• Sangat jarang dilaporkan\n`;
    }

    content += `\n**Kontraindikasi (Jangan Digunakan Jika):**\n`;
    herbal.contraindications.forEach(contra => {
      content += `• ${contra}\n`;
    });

    // Pregnancy/Lactation specific
    content += `\n**Keamanan pada Kehamilan & Menyusui:**\n`;
    content += `Hamil: ${herbal.pregnancy_lactation.pregnancy}\n`;
    content += `Menyusui: ${herbal.pregnancy_lactation.lactation}\n`;

    return {
      type: 'safety_concern',
      content: content
    };
  }

  /**
   * Handle: "Bisa dikombinasi kunyit + jahe?" / "Manfaat kombinasi?"
   */
  handleCombinationQuery(herbalIds) {
    if (herbalIds.length < 2) {
      return {
        type: 'combination_query',
        content: "Untuk mengecek kombinasi, sebutkan minimal 2 herbal. Contoh: 'Bisa dikombinasi kunyit + jahe?'"
      };
    }

    let content = `🔗 **Kombinasi Herbal**\n\n`;

    herbalIds.forEach((id1, idx1) => {
      const herbal1 = this.knowledgeBase.herbals.find(h => h.id === id1);
      if (!herbal1) return;

      herbalIds.forEach((id2, idx2) => {
        if (idx2 <= idx1) return;

        const herbal2 = this.knowledgeBase.herbals.find(h => h.id === id2);
        if (!herbal2) return;

        const interaction = herbal1.herbal_interactions.find(i =>
          i.herbal.toLowerCase().includes(herbal2.name_en.toLowerCase()) ||
          i.herbal.toLowerCase().includes(herbal2.name_id.toLowerCase())
        );

        content += `**${herbal1.name_id} + ${herbal2.name_id}**\n`;

        if (interaction) {
          content += `${interaction.type}\n`;
          content += `Keamanan: ${interaction.severity}\n`;
          content += `Rekomendasi: ${interaction.recommendation}\n\n`;
        } else {
          content += `Tidak ada interaksi herbal yang diketahui\n`;
          content += `Kombinasi dapat dipertimbangkan dengan monitoring dokter\n\n`;
        }
      });
    });

    return {
      type: 'combination_query',
      content: content
    };
  }

  /**
   * Embedded data fallback (sample)
   */
  getEmbeddedData() {
    // Return minimal embedded data if JSON fails to load
    console.log('Using embedded data fallback');
    return {
      metadata: { version: '1.0', total_herbals: 0 },
      herbals: []
    };
  }

  /**
   * Export recommendation for clinical use
   */
  generateClinicalReport(herbalName, patientContext = {}) {
    const herbal = this.findHerbal(herbalName);
    if (!herbal) return null;

    const report = {
      herbal: {
        name_id: herbal.name_id,
        name_en: herbal.name_en,
        latin_name: herbal.latin_name
      },
      grade: herbal.grade,
      clinical_uses: herbal.clinical_uses,
      dosage: herbal.dosage,
      safety: {
        profile: herbal.safety_profile.grade,
        adverse_effects: herbal.safety_profile.adverse_effects_common,
        contraindications: herbal.contraindications
      },
      patient_specific: {
        is_pregnant: patientContext.pregnant ? "CAUTION: " + herbal.pregnancy_lactation.pregnancy : null,
        is_nursing: patientContext.nursing ? "CAUTION: " + herbal.pregnancy_lactation.lactation : null,
        current_medications: patientContext.medications ? this.checkInteractions(herbalName, patientContext.medications) : []
      },
      evidence: {
        rct_count: herbal.clinical_evidence.rct_count,
        total_papers: herbal.clinical_evidence.total_papers
      }
    };

    return report;
  }

  /**
   * Check interactions with multiple drugs
   */
  checkInteractions(herbalName, medications = []) {
    const results = [];

    medications.forEach(med => {
      const result = this.checkInteraction(herbalName, med, 'drug');
      if (result.hasInteraction) {
        results.push({
          medication: med,
          ...result.interaction
        });
      }
    });

    return results;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HerbalConsultant;
}
