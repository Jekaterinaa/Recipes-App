import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <section className="flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold text-center">Welcome to AI Agents Edu</h1>
      <p className="text-center text-muted-foreground max-w-xl">
        Learn about AI agents through interactive demos and educational content. Connect with real Python-powered agents and explore how they work!
      </p>
      <Card className="w-full max-w-md p-6 flex flex-col items-center">
        <span className="font-semibold mb-2">Agent Interaction Placeholder</span>
        <div className="text-sm text-muted-foreground mb-4">(Coming soon: interact with an AI agent here)</div>
      </Card>
    </section>
  );
}
