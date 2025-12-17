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
            <Link href="/docs">
              <Button variant="ghost" className="text-white hover:text-blue-400">
                Docs
              </Button>
            </Link>
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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Memory as a Service
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            Give your AI applications long-term memory with semantic search and context retrieval.
          </p>
          <p className="text-lg text-slate-400 mb-4">
            MemVault is a vector database API that lets your AI agents remember conversations, user preferences, and important context across sessions. Built with PostgreSQL + pgvector for production-grade performance.
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <code className="text-sm text-slate-300 bg-slate-800 px-4 py-2 rounded">
              npm install @memvault/client
            </code>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started - From $29/month
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-blue-500 text-blue-400 hover:bg-blue-950/50">
                Read the Docs
              </Button>
            </Link>
          </div>
        </div>

        {/* Use Cases */}
        <div className="max-w-4xl mx-auto mt-16 mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Intelligent Memory Management</h2>
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-8 rounded-lg border border-blue-700/50 mb-8">
            <h3 className="text-2xl font-semibold text-blue-300 mb-4">Memory Consolidation with Sleep Cycles</h3>
            <p className="text-slate-300 mb-4">
              MemVault uses intelligent sleep cycles to automatically consolidate and optimize your memories, just like the human brain during sleep. The system periodically:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span><strong className="text-white">Analyzes relationships</strong> between stored memories to build semantic connections</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span><strong className="text-white">Consolidates similar memories</strong> to reduce redundancy while preserving important details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span><strong className="text-white">Optimizes vector embeddings</strong> for faster retrieval and better semantic search accuracy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span><strong className="text-white">Archives low-priority memories</strong> to keep your active memory space efficient</span>
              </li>
            </ul>
            <p className="text-slate-400 mt-4 text-sm">
              This automatic consolidation happens in the background, ensuring your AI always has access to the most relevant and efficiently organized memories.
            </p>
          </div>
          
          <h2 className="text-3xl font-bold text-white text-center mb-8">Built for AI Applications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">AI Chatbots & Assistants</h3>
              <p className="text-slate-400">Remember user conversations and preferences across sessions for truly personalized interactions</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Content Generation</h3>
              <p className="text-slate-400">Access relevant context and past outputs to maintain consistency and quality in generated content</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Personalization Engines</h3>
              <p className="text-slate-400">Tailor responses and recommendations based on comprehensive user history and behavioral patterns</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Knowledge Retrieval</h3>
              <p className="text-slate-400">Search through memories with GraphRAG-powered semantic understanding for accurate context retrieval</p>
            </div>
          </div>
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
