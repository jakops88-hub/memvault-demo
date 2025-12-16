"use client";

export default function PlaygroundPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
        <p className="mt-2 text-muted-foreground">
          Interactive memory testing environment
        </p>
      </div>

      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Coming soon: Interactive neural memory visualization
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This will be your old demo with the neural graph
        </p>
      </div>
    </div>
  );
}
