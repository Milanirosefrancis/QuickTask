"use client"

import React from 'react'

// 'export default' tells Next.js: "This is the main component for this page"
export default function SharedTasksPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Shared with Me</h1>
      <div className="bg-card p-6 rounded-lg border border-dashed text-center">
        <p className="text-muted-foreground">
          No tasks have been shared with you yet.
        </p>
      </div>
    </div>
  )
}