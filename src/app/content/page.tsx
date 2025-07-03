import { AppShell } from "@/components/app-shell";
import ContentForm from "./content-form";

export default function ContentPage() {
    return (
        <AppShell>
            <div className="flex flex-col gap-8">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Planner</h1>
                    <p className="text-muted-foreground">
                        Use AI to generate fresh content ideas for your clients.
                    </p>
                </div>
                <ContentForm />
            </div>
        </AppShell>
    );
}
