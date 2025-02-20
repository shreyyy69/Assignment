import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateLessonContent, type GeneratedLessonPlan } from '@/lib/gemini';
import { generatePDF } from '@/lib/pdf';

interface LessonPlannerProps {
  user: {
    email: string;
    isAuthenticated: boolean;
  };
}

interface SavedLessonPlan {
  input: {
    topic: string;
    gradeLevel: string;
    mainConcept: string;
    materials: string;
    objectives: string;
  };
  generatedContent: GeneratedLessonPlan | null;
}

export function LessonPlanner({ user }: LessonPlannerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState({
    topic: '',
    gradeLevel: '',
    mainConcept: '',
    materials: '',
    objectives: '',
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedLessonPlan | null>(null);

  // Load saved lesson plan from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem(`lessonPlan-${user.email}`);
    if (savedPlan) {
      const { input, generatedContent: savedContent } = JSON.parse(savedPlan) as SavedLessonPlan;
      setLessonPlan(input);
      setGeneratedContent(savedContent);
    }
  }, [user.email]);

  // Save lesson plan to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`lessonPlan-${user.email}`, JSON.stringify({
      input: lessonPlan,
      generatedContent,
    }));
  }, [lessonPlan, generatedContent, user.email]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLessonPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleGradeChange = (value: string) => {
    setLessonPlan((prev) => ({ ...prev, gradeLevel: value }));
  };

  const generateLessonPlan = async () => {
    if (!lessonPlan.topic || !lessonPlan.gradeLevel) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in at least the topic and grade level.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const content = await generateLessonContent(lessonPlan);
      setGeneratedContent(content);
      toast({
        title: 'Success',
        description: 'Lesson plan generated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate lesson plan',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      await generatePDF({
        ...lessonPlan,
        generatedContent: generatedContent || undefined,
      });
      toast({
        title: 'Success',
        description: 'PDF downloaded successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lesson Planner</h1>
        <ThemeToggle />
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Input
                name="topic"
                value={lessonPlan.topic}
                onChange={handleInputChange}
                placeholder="Enter lesson topic"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Grade Level</label>
              <Select
                value={lessonPlan.gradeLevel}
                onValueChange={handleGradeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1}`}>
                      Grade {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger>Lesson Details</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Main Concept & Subtopics
                    </label>
                    <Textarea
                      name="mainConcept"
                      value={lessonPlan.mainConcept}
                      onChange={handleInputChange}
                      placeholder="Enter main concept and subtopics"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Materials Needed
                    </label>
                    <Textarea
                      name="materials"
                      value={lessonPlan.materials}
                      onChange={handleInputChange}
                      placeholder="List required materials"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Learning Objectives
                    </label>
                    <Textarea
                      name="objectives"
                      value={lessonPlan.objectives}
                      onChange={handleInputChange}
                      placeholder="Define learning objectives"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {generatedContent && (
              <AccordionItem value="generated">
                <AccordionTrigger>Generated Lesson Plan</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Introduction</h3>
                      <p className="mt-2 text-sm">{generatedContent.introduction}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Main Content</h3>
                      <p className="mt-2 text-sm">{generatedContent.mainContent}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Activities</h3>
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {generatedContent.activities.map((activity, index) => (
                          <li key={index}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Assessment</h3>
                      <p className="mt-2 text-sm">{generatedContent.assessment}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Conclusion</h3>
                      <p className="mt-2 text-sm">{generatedContent.conclusion}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          ) : null}

          <div className="flex gap-4">
            <Button
              onClick={generateLessonPlan}
              disabled={isLoading}
              className="flex-1"
            >
              Generate Lesson Plan
            </Button>
            <Button
              onClick={downloadPDF}
              variant="outline"
              disabled={isLoading || !generatedContent}
              className="flex-1"
            >
              Download PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}