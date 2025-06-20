
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
import { Sparkles, FileText, UploadCloud } from 'lucide-react';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';


const storyFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(100),
  storyText: z
    .string()
    .min(1, { message: 'Story text or a successfully read file is required.' })
    .max(50000, { message: 'Story text must be less than 50000 characters (or file content is too large).' }),
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

  const storyFileRef = form.register("storyFile");

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'storyFile') {
        const fileList = value.storyFile;
        if (fileList && fileList.length > 0) {
          const file = fileList[0];
          setFileName(file.name);
          
          if (file.type === 'text/plain' || file.name.endsWith('.md')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const text = e.target?.result as string;
              if (text.length > 50000) {
                  toast({
                    title: "File Too Large",
                    description: "The content of the selected file exceeds the 50,000 character limit. Please use a smaller file or paste the content manually.",
                    variant: "destructive",
                  });
                  form.setValue('storyText', ''); // Clear textarea if file is too large
                  form.resetField('storyFile'); // Clear the file input
                  setFileName(null);
              } else {
                form.setValue('storyText', text, { shouldValidate: true });
                toast({ title: "File Content Loaded", description: `Content from "${file.name}" loaded into the story text area.` });
              }
            };
            reader.onerror = () => {
              toast({ title: "File Read Error", description: "Could not read the file content.", variant: "destructive" });
              setFileName(null);
            };
            reader.readAsText(file);
          } else if (file) {
             toast({ 
                title: "File Type Note", 
                description: `Selected "${file.name}". Content extraction is only supported for .txt and .md files. For other types, please paste content manually.`,
                variant: "default"
            });
            form.setValue('storyText', ''); // Clear storyText for non-txt/md files
          }
        } else {
          setFileName(null);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, toast]);


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-2">
            <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="font-headline text-3xl">Create Your Story Video</CardTitle>
        <CardDescription>
          Enter your story details below, or upload a document. Our AI will analyze it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Story Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., The Lost Astronaut" {...field} className="text-base py-3" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="storyFile"
              render={() => ( // field is not directly used here due to custom registration
                <FormItem>
                  <FormLabel className="text-lg flex items-center gap-2">
                    <UploadCloud className="h-5 w-5" />
                    Or Upload a Document
                  </FormLabel>
                  <FormControl>
                     <Input 
                        type="file" 
                        {...storyFileRef}
                        className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        accept=".txt,.md,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      />
                  </FormControl>
                  {fileName && <FormDescription>Selected file: {fileName}</FormDescription>}
                  <FormDescription>
                    Supports .txt, .md (content extracted), .pdf, .doc, .docx. Max 50,000 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storyText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Your Story</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Once upon a time in a galaxy far, far away... (or content from your .txt/.md file will appear here)"
                      className="min-h-[200px] text-base py-3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                  Analyzing Story...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Analyze Story & Start Project
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
