import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/trends")({ component: Trends });

function Trends() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Market Trends</h1>
        <p className="text-sm text-muted-foreground">Where capital, talent, and attention are flowing right now.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-primary/20 border border-primary/30 grid place-items-center mb-4">
          <Inbox className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Trend data coming soon</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">Market trend analytics will appear here once you have validated ideas with industry benchmarks.</p>
        <Link to="/dashboard/validate">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <span className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-glow">
              Validate an idea to unlock trends
            </span>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
