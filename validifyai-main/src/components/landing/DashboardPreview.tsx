export function DashboardPreview() {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-sm text-primary font-medium">Dashboard</p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
            A workspace that <span className="text-gradient">thinks like a VC</span>
          </h2>
        </div>
        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Industry trends</div>
                  <div className="text-lg font-semibold">Validation signals · last 7 months</div>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                Connect your ideas to see trend data
              </div>
            </div>
            <div className="space-y-4">
              {["Validation Score", "Active Ideas", "Reports"].map((label) => (
                <div key={label} className="glass rounded-2xl p-5">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="mt-1 text-3xl font-semibold">—</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
