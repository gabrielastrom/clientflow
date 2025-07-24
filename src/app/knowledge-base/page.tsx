
"use client";

import * as React from "react";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

const articles = [
    {
        title: "Onboarding New Clients",
        description: "A step-by-step guide to integrate new clients into our workflow.",
        category: "Client Management",
        href: "#"
    },
    {
        title: "Content Creation Best Practices",
        description: "Guidelines for creating engaging content for different social media platforms.",
        category: "Content Strategy",
        href: "#"
    },
    {
        title: "Using the Time Tracking Tool",
        description: "How to effectively log hours and generate reports.",
        category: "Internal Tools",
        href: "#"
    },
    {
        title: "Monthly Reporting Standards",
        description: "Instructions on how to create and present monthly performance reports to clients.",
        category: "Reporting",
        href: "#"
    },
    {
        title: "Crisis Management Protocol",
        description: "Steps to take in case of a social media crisis for a client.",
        category: "Client Management",
        href: "#"
    },
    {
        title: "Brand Voice Guidelines",
        description: "How to adapt our writing style to fit different client brand voices.",
        category: "Content Strategy",
        href: "#"
    }
];


export default function KnowledgeBasePage() {
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredArticles = articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
    <AppShell>
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                <p className="text-muted-foreground">Find guides, tutorials, and answers to your questions.</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search articles..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Articles</CardTitle>
                    <CardDescription>Browse through all available articles and guides.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredArticles.length > 0 ? filteredArticles.map((article, index) => (
                            <Link href={article.href} key={index} className="group">
                                <Card className="h-full hover:border-primary transition-all">
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                <BookOpen className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg group-hover:text-primary transition-colors">{article.title}</CardTitle>
                                                <CardDescription className="text-sm">{article.category}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{article.description}</p>
                                        <div className="flex items-center justify-end text-sm font-medium text-primary mt-4 group-hover:underline">
                                            Read more
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )) : (
                            <p className="text-muted-foreground md:col-span-3 text-center py-8">No articles found matching your search.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    </AppShell>
  );
}
