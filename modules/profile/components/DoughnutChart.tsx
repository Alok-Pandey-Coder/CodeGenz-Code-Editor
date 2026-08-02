"use client"
import React, { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { getPlaygroundCountsByType } from "../actions"

type PlaygroundCount = {
  type: string
  count: number
}

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#0ea5e9", "#818cf8", "#f472b6", "#facc15"]

const DoughnutChart = () => {
  const [data, setData] = useState<PlaygroundCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const result = await getPlaygroundCountsByType()
        if (result) setData(result)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCounts()
  }, [])

  const total = data.reduce((sum, d) => sum + d.count, 0)

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        Loading chart...
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        No playgrounds yet
      </div>
    )
  }

  return (
    <div className="relative bg-[#0f0f12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/40">
      <p className="text-xs font-mono text-emerald-500/80 mb-1">// playground_distribution.tsx</p>
      <h2 className="text-lg font-semibold text-white mb-4">Playgrounds by Type</h2>

      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0d0d0f",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              labelStyle={{ color: "#e5e7eb" }}
              itemStyle={{ color: "#10b981" }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-semibold text-white">{total}</span>
          <span className="text-xs text-gray-500">Total</span>
        </div>
      </div>

      {/* legend */}
      <div className="mt-5 flex flex-wrap gap-3">
        {data.map((entry, index) => (
          <div key={entry.type} className="flex items-center gap-2 text-xs text-gray-400">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {entry.type} · {entry.count}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoughnutChart