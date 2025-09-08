import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMockAuth } from "@/hooks/useMockAuth";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCourseSchema } from "../../../shared/schema";
import { ArrowLeft, BookOpen, Upload, Plus, X } from "lucide-react";

const createCourseFormSchema = insertCourseSchema.extend({
  modules: z.array(z.object({
    title: z.string().min(1, "Module title is required"),
    description: z.string().optional(),
    content: z.string().optional(),
  })).optional(),
});

type CreateCourseForm = z.infer<typeof createCourseFormSchema>;

export default function CreateCoursePage() {
  const { isAuthenticated, isLoading: authLoading, user } = useMockAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modules, setModules] = useState<Array<{title: string; description: string; content: string}>>([]);

  const form = useForm<CreateCourseForm>({
    resolver: zodResolver(createCourseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "academic",
      duration: "",
      difficulty: "beginner",
      category: "",
      imageUrl: "",
      isPublic: true,
      maxStudents: 50,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: CreateCourseForm) => {
      return await apiRequest('POST', '/api/courses', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/courses'] });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCourseForm) => {
    createCourseMutation.mutate({
      ...data,
      modules: modules.length > 0 ? modules : undefined,
    });
  };

  const addModule = () => {
    setModules([...modules, { title: "", description: "", content: "" }]);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const updateModule = (index: number, field: string, value: string) => {
    setModules(modules.map((module, i) => 
      i === index ? { ...module, [field]: value } : module
    ));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Create New Course</h1>
          <p className="text-on-surface-variant">Design and build your course curriculum</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduction to Web Development" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a detailed description of what students will learn..." 
                          className="min-h-[100px]"
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Programming, Design, Business..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="8 weeks, 3 months..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Students</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50" 
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Public Course</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Make this course visible to all students
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Course Modules</span>
                </div>
                <Button type="button" variant="outline" onClick={addModule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {modules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No modules added yet. Click "Add Module" to start building your course content.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {modules.map((module, index) => (
                    <div key={index} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">Module {index + 1}</h4>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeModule(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Module Title</label>
                          <Input
                            placeholder="e.g., Introduction to HTML"
                            value={module.title}
                            onChange={(e) => updateModule(index, 'title', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            placeholder="Brief description of this module..."
                            value={module.description}
                            onChange={(e) => updateModule(index, 'description', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Content</label>
                          <Textarea
                            placeholder="Detailed learning materials, instructions, exercises..."
                            className="min-h-[100px]"
                            value={module.content}
                            onChange={(e) => updateModule(index, 'content', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Course Materials</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">Upload Course Files</div>
                <div className="text-sm text-gray-500 mb-4">
                  Drag and drop files or click to browse
                </div>
                <Button type="button" variant="outline">
                  Choose Files
                </Button>
                <div className="text-xs text-gray-400 mt-2">
                  Support for PDF, DOCX, PPT, images, and video files
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => setLocation('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCourseMutation.isPending}>
              {createCourseMutation.isPending ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </Form>
      </div>
    </div>
  );
}