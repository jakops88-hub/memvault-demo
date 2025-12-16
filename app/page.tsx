"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Shield, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">MemVault</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" className="text-white hover:text-blue-400">
                Pricing
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Memory as a Service
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Persistent memory API for AI applications. Store, retrieve, and
            search memories with semantic understanding.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started - $99/month
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <Zap className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Fast & Scalable</h3>
            <p className="text-slate-400">
              Vector-based semantic search with PostgreSQL + pgvector
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <Shield className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Secure</h3>
            <p className="text-slate-400">
              API key authentication with usage tracking and rate limiting
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <CheckCircle className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Simple API</h3>
            <p className="text-slate-400">
              RESTful API with comprehensive documentation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
