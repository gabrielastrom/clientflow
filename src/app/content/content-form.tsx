"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";
import { Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { suggestContentIdeas } from "@/ai/flows/suggest-content-ideas";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  clientDescription: z.string().min(10, {
    message: "Client description must be at least 10 characters.",
  }),
  socialTrends: z.string().min(10, {
    message: "Social trends must be at least 10 characters.",
  }),
  platform: z.string().min(2, {
    message: "Platform must be at least 2 characters.",
  }),
});

export default function ContentForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [ideas, setIdeas] = React.useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      clientDescription: "",
      socialTrends: "Reels, User-generated content, AI influencers",
      platform: "Instagram",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setIdeas([]);
    try {
      const result = await suggestContentIdeas(data);
      if (result.contentIdeas) {
        setIdeas(result.contentIdeas);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate content ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>Idea Generator</CardTitle>
                    <CardDescription>Provide details to spark some ideas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., A local coffee shop specializing in artisanal, single-origin beans and a cozy atmosphere."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialTrends"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Media Trends</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Short-form video, authenticity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., TikTok, Instagram" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Ideas
                  </Button>
                </CardFooter>
            </form>
          </Form>
        </Card>
        <Card className="lg:col-span-2 min-h-[500px]">
            <CardHeader>
                <CardTitle>Generated Content Ideas</CardTitle>
                <CardDescription>Here are some AI-powered suggestions for you.</CardDescription>
            </CardHeader>
            <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating amazing ideas...</p>
              </div>
            )}
            {!isLoading && ideas.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Wand2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Your content ideas will appear here.</p>
                </div>
            )}
            {ideas.length > 0 && (
                <ul className="space-y-3 list-disc pl-5">
                    {ideas.map((idea, index) => (
                        <li key={index} className="text-sm transition-opacity animate-in fade-in-0 duration-500" style={{ animationDelay: `${index * 100}ms` }}>{idea}</li>
                    ))}
                </ul>
            )}
            </CardContent>
        </Card>
    </div>
  );
}
