
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, UploadCloud, CheckCircle } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const storyFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(100, { message: 'Title must be less than 100 characters.' }),
  storyText: z
    .string()
    .min(1, { message: 'Story text or a successfully read file is required.' })
    .max(50000, { message: 'Story text must be less than 50,000 characters (or file content is too large).' }),
  storyFile: z.custom<FileList>((val) => val instanceof FileList ? val : null).optional(),
});


export type StoryFormValues = z.infer<typeof storyFormSchema>;

interface StoryInputFormProps {
  onSubmit: (values: StoryFormValues) => void;
  isLoading?: boolean;
  defaultValues?: Partial<StoryFormValues>;
}

export function StoryInputForm({ onSubmit, isLoading = false, defaultValues }: StoryInputFormProps) {
  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: defaultValues || { title: '', storyText: '' },
  });
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileReadSuccess, setFileReadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storyFileWatch = form.watch("storyFile");

  useEffect(() => {
    if (storyFileWatch && storyFileWatch.length > 0) {
      const file = storyFileWatch[0];
      setFileName(file.name);
      setFileReadSuccess(false); // Reset on new file selection
      
      if (file.type === 'text/plain' || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text.length > 50000) {
              toast({
                title: "File Too Large",
                description: "Content exceeds 50,000 characters. Use a smaller file or paste manually.",
                variant: "destructive",
              });
              form.setValue('storyText', ''); 
              if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
              form.resetField('storyFile');
              setFileName(null);
          } else {
            form.setValue('storyText', text, { shouldValidate: true });
            setFileReadSuccess(true);
            toast({ title: "File Content Loaded", description: `Content from "${file.name}" loaded.` });
          }
        };
        reader.onerror = () => {
          toast({ title: "File Read Error", description: "Could not read file content.", variant: "destructive" });
          setFileName(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          form.resetField('storyFile');
        };
        reader.readAsText(file);
      } else if (file) {
         toast({ 
            title: "File Type Note", 
            description: `Selected "${file.name}". Auto-extraction for .txt/.md only. Paste other content manually.`,
        });
        form.setValue('storyText', ''); // Clear storyText as content isn't auto-read
      }
    } else {
      setFileName(null);
      setFileReadSuccess(false);
    }
  }, [storyFileWatch, form, toast]);


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-border">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-3">
            <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="font-headline text-3xl md:text-4xl">Start Your AI Video Project</CardTitle>
        <CardDescription className="text-base">
          Provide a title and your story text, or upload a document.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Story Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., The Journey of Luna" {...field} className="text-base py-3 h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="storyFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold flex items-center gap-2">
                    <UploadCloud className="h-6 w-6 text-primary" />
                    Upload Document (Optional)
                  </FormLabel>
                  <FormControl>
                     <Input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => field.onChange(e.target.files)}
                        className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer h-12 pt-3"
                        accept=".txt,.md,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        aria-describedby="file-description"
                      />
                  </FormControl>
                  <FormDescription id="file-description">
                    Supports .txt, .md (content auto-loaded), .pdf, .doc, .docx. Max 50,000 characters for auto-load.
                  </FormDescription>
                  {fileName && (
                    <div className={cn("mt-2 text-sm flex items-center", fileReadSuccess ? "text-green-600" : "text-muted-foreground")}>
                      {fileReadSuccess && <CheckCircle className="h-4 w-4 mr-2" />}
                      Selected: {fileName} {fileReadSuccess && "(Content loaded)"}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storyText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Your Story</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Once upon a time... (or content from your .txt/.md file will appear here)"
                      className="min-h-[250px] text-base py-3"
                      {...field}
                      aria-label="Story text input area"
                    />
                  </FormControl>
                   <FormDescription>
                    Enter your story or it will be auto-filled if you upload a compatible .txt or .md file.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full text-lg py-6 h-14" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                  Analyzing Story...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Analyze & Create Project
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
