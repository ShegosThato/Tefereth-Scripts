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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText } from 'lucide-react';

const storyFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(100),
  storyText: z
    .string()
    .min(50, { message: 'Story text must be at least 50 characters.' })
    .max(10000, { message: 'Story text must be less than 10000 characters.' }),
  // TODO: Add file upload field if needed
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

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-2">
            <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="font-headline text-3xl">Create Your Story Video</CardTitle>
        <CardDescription>
          Enter your story details below. Our AI will analyze it and help you create a stunning video.
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
              name="storyText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Your Story</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Once upon a time in a galaxy far, far away..."
                      className="min-h-[200px] text-base py-3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* TODO: Add file input component here */}
            {/* <div className="space-y-2">
              <Label htmlFor="story-file" className="text-lg">Or Upload a Document</Label>
              <Input id="story-file" type="file" accept=".txt,.md,.docx" className="text-base" />
              <p className="text-sm text-muted-foreground">Max file size: 5MB. Supported formats: .txt, .md, .docx</p>
            </div> */}
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
