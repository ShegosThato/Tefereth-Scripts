
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
import { Sparkles, FileText, UploadCloud, CheckCircle, Paperclip } from 'lucide-react';
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
      setFileReadSuccess(false); 
      
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
              if (fileInputRef.current) fileInputRef.current.value = ""; 
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
            variant: "default"
        });
        form.setValue('storyText', ''); 
      }
    } else {
      setFileName(null);
      setFileReadSuccess(false);
    }
  }, [storyFileWatch, form, toast]);


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-border/70 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="text-center bg-gradient-to-br from-card to-card/90 p-8">
        <div className="flex justify-center items-center mb-4">
            <Sparkles className="h-14 w-14 text-primary animate-pulse" />
        </div>
        <CardTitle className="font-headline text-3xl md:text-4xl font-bold text-foreground">Start Your AI Video Project</CardTitle>
        <CardDescription className="text-base text-muted-foreground mt-1">
          Provide a title and your story text, or upload a document.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Story Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., The Journey of Luna" {...field} className="text-base py-3 h-12 shadow-sm focus:shadow-md" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="storyFile"
              render={({ field: { onChange, value, ...restField }}) => ( 
                <FormItem>
                  <FormLabel htmlFor="story-file-input" className="text-lg font-semibold flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-primary" />
                    Attach Document (Optional)
                  </FormLabel>
                   <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                        <UploadCloud className="h-5 w-5" />
                    </div>
                    <FormControl>
                        <Input 
                            id="story-file-input"
                            type="file" 
                            ref={fileInputRef}
                            onChange={(e) => onChange(e.target.files)} 
                            {...restField} 
                            className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer h-12 pl-10 pr-3 shadow-sm focus:shadow-md"
                            accept=".txt,.md,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            aria-describedby="file-description"
                        />
                    </FormControl>
                  </div>
                  <FormDescription id="file-description" className="mt-1.5">
                    Supports .txt, .md (content auto-loaded). Max 50,000 characters for auto-load.
                  </FormDescription>
                  {fileName && (
                    <div className={cn("mt-2 text-sm flex items-center p-2 rounded-md", fileReadSuccess ? "text-green-700 dark:text-green-400 bg-green-500/10" : "text-muted-foreground bg-muted/50")}>
                      {fileReadSuccess ? <CheckCircle className="h-4 w-4 mr-2 shrink-0" /> : <FileText className="h-4 w-4 mr-2 opacity-70 shrink-0" />}
                      <span className="truncate">Selected: <strong className="ml-1.5 mr-1">{fileName}</strong> {fileReadSuccess && "(Content loaded)"}</span>
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
                      className="min-h-[250px] text-base py-3 shadow-sm focus:shadow-md"
                      {...field}
                      aria-label="Story text input area"
                    />
                  </FormControl>
                   <FormDescription className="mt-1.5">
                    Enter your story or it will be auto-filled if you upload a compatible .txt or .md file.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full text-lg py-6 h-14 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
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
