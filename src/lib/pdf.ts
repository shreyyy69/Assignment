import html2pdf from 'html2pdf.js';

export interface LessonPlanPDF {
  topic: string;
  gradeLevel: string;
  mainConcept: string;
  materials: string;
  objectives: string;
  generatedContent?: {
    introduction: string;
    mainContent: string;
    activities: string[];
    assessment: string;
    conclusion: string;
  };
}

export async function generatePDF(lessonPlan: LessonPlanPDF) {
  const content = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #2563eb; text-align: center;">${lessonPlan.topic}</h1>
      <div style="margin: 20px 0;">
        <p><strong>Grade Level:</strong> ${lessonPlan.gradeLevel}</p>
        <p><strong>Main Concept:</strong> ${lessonPlan.mainConcept}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h2 style="color: #4b5563;">Materials Needed</h2>
        <p>${lessonPlan.materials}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h2 style="color: #4b5563;">Learning Objectives</h2>
        <p>${lessonPlan.objectives}</p>
      </div>
      
      ${lessonPlan.generatedContent ? `
        <div style="margin: 20px 0;">
          <h2 style="color: #4b5563;">Lesson Plan</h2>
          
          <h3>Introduction</h3>
          <p>${lessonPlan.generatedContent.introduction}</p>
          
          <h3>Main Content</h3>
          <p>${lessonPlan.generatedContent.mainContent}</p>
          
          <h3>Activities</h3>
          <ul>
            ${lessonPlan.generatedContent.activities.map(activity => `<li>${activity}</li>`).join('')}
          </ul>
          
          <h3>Assessment</h3>
          <p>${lessonPlan.generatedContent.assessment}</p>
          
          <h3>Conclusion</h3>
          <p>${lessonPlan.generatedContent.conclusion}</p>
        </div>
      ` : ''}
    </div>
  `;

  const opt = {
    margin: 1,
    filename: `lesson-plan-${lessonPlan.topic.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(content).save();
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}