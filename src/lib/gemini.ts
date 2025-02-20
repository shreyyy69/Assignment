import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing Gemini API key. Please add VITE_GEMINI_API_KEY to your environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

export interface LessonPlanInput {
  topic: string;
  gradeLevel: string;
  mainConcept: string;
  materials: string;
  objectives: string;
}

export interface GeneratedLessonPlan {
  introduction: string;
  mainContent: string;
  activities: string[];
  assessment: string;
  conclusion: string;
}

export async function generateLessonContent(input: LessonPlanInput): Promise<GeneratedLessonPlan> {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Create a detailed lesson plan for the following:
    Topic: ${input.topic}
    Grade Level: ${input.gradeLevel}
    Main Concept: ${input.mainConcept}
    Materials Needed: ${input.materials}
    Learning Objectives: ${input.objectives}

    Please provide a structured response with the following sections:
    1. Introduction (engaging hook and overview)
    2. Main Content (key concepts and teaching points)
    3. Activities (numbered list of hands-on activities)
    4. Assessment (how to measure learning outcomes)
    5. Conclusion (summary and reflection)

    Format the response clearly with section headers.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split the text into sections based on headers
    const sections = text.split(/(?=\d\.\s+(?:Introduction|Main Content|Activities|Assessment|Conclusion))/i);
    
    // Extract content for each section
    const introduction = sections.find(s => /introduction/i.test(s))?.replace(/.*?introduction[:\s]*/i, '').trim() || '';
    const mainContent = sections.find(s => /main content/i.test(s))?.replace(/.*?main content[:\s]*/i, '').trim() || '';
    const activitiesSection = sections.find(s => /activities/i.test(s))?.replace(/.*?activities[:\s]*/i, '').trim() || '';
    const assessment = sections.find(s => /assessment/i.test(s))?.replace(/.*?assessment[:\s]*/i, '').trim() || '';
    const conclusion = sections.find(s => /conclusion/i.test(s))?.replace(/.*?conclusion[:\s]*/i, '').trim() || '';

    // Split activities into an array
    const activities = activitiesSection
      .split(/(?:\r?\n)+/)
      .filter(activity => activity.trim().length > 0)
      .map(activity => activity.replace(/^\d+\.\s*/, '').trim());
    
    return {
      introduction,
      mainContent,
      activities,
      assessment,
      conclusion,
    };
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw new Error('Failed to generate lesson plan. Please ensure your API key is valid and try again.');
  }
}