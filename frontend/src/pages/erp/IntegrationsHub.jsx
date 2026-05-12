import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plug, Settings, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';

/** High-level integrations overview; detailed SMTP/API keys live under Settings. */
export default function IntegrationsHub({ user }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Integrations" user={user} />
      <main className="space-y-6 p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-white/10">
            <CardContent className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <Plug className="h-8 w-8 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Connected services</h2>
                  <p className="mt-1 max-w-xl text-sm text-slate-400">
                    Configure payment gateways, email, SMS, and API keys in Settings. This page is the operational hub
                    for integration health and deep links.
                  </p>
                </div>
              </div>
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <Settings className="h-4 w-4" />
                Open integration settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
