import React from 'react';
import { motion } from 'framer-motion';
import { BookMarked } from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';

/** Khata / ledger hub — extend with party balances and credit tracking. */
export default function Khata({ user }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Khata" user={user} />
      <main className="p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-white/10">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <BookMarked className="h-10 w-10 text-amber-400/80" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Khata · ledger</h2>
                <p className="mt-2 max-w-md text-sm text-slate-400">
                  Track udhar, party-wise balances, and settlements. Link this to Sales & billing records when you
                  implement ledger APIs.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
