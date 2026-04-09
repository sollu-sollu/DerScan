import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { AnalysisResult } from './api';
import { Platform } from 'react-native';

/**
 * PDF Service for DerScan
 * Handles generating and sharing professional PDF clinical reports.
 */
export async function generateAndSharePDF(result: AnalysisResult, userName: string) {
  try {
    const htmlContent = generateHTMLTemplate(result, userName);

    const options = {
      html: htmlContent,
      fileName: `DerScan_Report_${result.scan_id}`,
      directory: Platform.OS === 'android' ? 'Cache' : 'Documents',
    };

    const file = await generatePDF(options);
    
    if (file.filePath) {
      // Format the path for Sharing. On Android, the path needs a 'file://' prefix
      const filePath = Platform.OS === 'android' ? `file://${file.filePath}` : file.filePath;

      await Share.open({
        url: filePath,
        type: 'application/pdf',
        title: 'DerScan Clinical Report',
        subject: `Skin Analysis Report - ${result.condition_name}`,
        failOnCancel: false,
      });
    }
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
}

function generateHTMLTemplate(result: AnalysisResult, userName: string): string {
  const date = new Date(result.timestamp).toLocaleDateString();
  const severityColor = getSeverityColor(result.severity);
  
  // Format clinical features as list items
  const observations = result.clinical_features 
    ? result.clinical_features.map(f => `<li>${f}</li>`).join('') 
    : '<li>No specific clinical features noted.</li>';

  // Format routine as table rows
  const routine = result.daily_routine
    ? result.daily_routine.map(r => `
      <tr>
        <td class="time">${r.time}</td>
        <td>
          <strong>${r.title}</strong><br/>
          <span class="subtitle">${r.subtitle}</span>
        </td>
      </tr>
    `).join('')
    : '<tr><td colspan="2">No clinical routine generated.</td></tr>';

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.6; padding: 40px; }
          .header { border-bottom: 2px solid #1F4E5A; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .logo { color: #1F4E5A; font-size: 28px; font-weight: bold; }
          .report-tag { background: #1F4E5A; color: white; padding: 5px 15px; border-radius: 5px; font-size: 12px; }
          
          .user-info { margin-bottom: 30px; }
          .user-info p { margin: 5px 0; font-size: 14px; }
          
          .diagnosis-box { background: #f9f9f9; border-left: 5px solid ${severityColor}; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0; }
          .diagnosis-title { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
          .condition-name { font-size: 24px; font-weight: bold; color: #1F4E5A; margin: 0; }
          
          .severity-indicator { display: flex; align-items: center; margin-top: 10px; }
          .severity-badge { background: ${severityColor}; color: white; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 10px; }
          
          h2 { color: #1F4E5A; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px; }
          
          .clinical-list { padding-left: 20px; }
          .clinical-list li { margin-bottom: 8px; font-size: 14px; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
          .time { width: 100px; color: #1F4E5A; font-weight: bold; font-size: 13px; }
          .subtitle { font-size: 12px; color: #666; }
          
          .image-container { text-align: center; margin: 30px 0; }
          .scanned-image { max-width: 400px; border-radius: 10px; border: 1px solid #ddd; }
          
          .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
          .disclaimer { font-style: italic; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">DerScan</div>
          <div class="report-tag">CLINICAL ANALYSIS REPORT</div>
        </div>

        <div class="user-info">
          <p><strong>Patient Name:</strong> ${userName}</p>
          <p><strong>Scan Date:</strong> ${date}</p>
          <p><strong>Scan ID:</strong> ${result.scan_id}</p>
        </div>

        <div class="diagnosis-box">
          <div class="diagnosis-title">Most Likely Diagnosis</div>
          <p class="condition-name">${result.condition_name}</p>
          <div class="severity-indicator">
            <span class="severity-badge">${result.severity_label}</span>
            <span>Severity Score: ${result.severity} / 10</span>
          </div>
        </div>

        ${result.image_uri ? `
        <div class="image-container">
          <img src="${result.image_uri}" class="scanned-image" />
          <p style="font-size: 10px; color: #666; margin-top: 5px;">Analyzed Skin Area</p>
        </div>
        ` : ''}

        <h2>Clinical Summary</h2>
        <p style="font-size: 14px;">${result.description}</p>

        <h2>Clinical Observations</h2>
        <ul class="clinical-list">
          ${observations}
        </ul>

        <h2>Recommended Recovery Routine</h2>
        <table>
          ${routine}
        </table>

        ${result.lifestyle_adjustments && result.lifestyle_adjustments.length > 0 ? `
        <h2>Lifestyle & Habits</h2>
        <ul class="clinical-list">
          ${result.lifestyle_adjustments.map(l => `<li><strong>${l.title}:</strong> ${l.subtitle}</li>`).join('')}
        </ul>
        ` : ''}

        <div class="footer">
          <p>© 2026 DerScan AI Powered Dermatology. Generated by MedGemma AI Engine.</p>
          <p class="disclaimer">IMPORTANT: This report is generated by an Artificial Intelligence and is for informational purposes only. It does NOT constitute medical advice. Please consult a qualified dermatologist for official diagnosis and treatment.</p>
        </div>
      </body>
    </html>
  `;
}

function getSeverityColor(severity: number): string {
  if (severity <= 3) return '#4CAF50';
  if (severity <= 5) return '#FFEB3B';
  if (severity <= 7) return '#FF9800';
  return '#F44336';
}
