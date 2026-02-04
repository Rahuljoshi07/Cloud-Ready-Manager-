'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.h1
          className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Full Stack Application
        </motion.h1>
        
        <motion.p
          className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Modern web application built with React, TypeScript, Next.js, Tailwind CSS, 
          Framer Motion, Zustand, Node.js, Express, and PostgreSQL
        </motion.p>

        <motion.div
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <FeatureCard
            title="🎨 Frontend"
            features={[
              'React 18 with Hooks',
              'TypeScript for type safety',
              'Next.js 14 (SSR/SSG)',
              'Tailwind CSS styling',
              'Framer Motion animations',
              'Zustand state management'
            ]}
          />
          
          <FeatureCard
            title="⚙️ Backend"
            features={[
              'Node.js + Express',
              'PostgreSQL database',
              'RESTful API design',
              'Docker containerization',
              'CRUD operations',
              'Security best practices'
            ]}
          />
        </motion.div>

        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/users">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              View Users
            </motion.button>
          </Link>
          
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-lg hover:bg-purple-700 transition"
            >
              View Products
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ title, features }: { title: string; features: string[] }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl"
    >
      <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h3>
      <ul className="text-left space-y-2">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-gray-600 dark:text-gray-300 flex items-center"
          >
            <span className="mr-2">✓</span>
            {feature}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
