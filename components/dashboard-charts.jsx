"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

export function DashboardCharts({ products, movements }) {
  const categoryData = useMemo(() => {
    const map = {};
    for (const p of products) map[p.category] = (map[p.category] || 0) + p.stockQuantity * p.unitCost;
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [products]);

  const movementData = useMemo(() => {
    const map = {};
    for (const m of movements.slice(0, 10).reverse()) {
      const key = new Date(m.movementDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      map[key] = map[key] || { name: key, received: 0, issued: 0 };
      if (m.type === "RECEIVE") map[key].received += m.quantity;
      if (m.type === "ISSUE") map[key].issued += m.quantity;
    }
    return Object.values(map);
  }, [movements]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Movement pulse</CardTitle></CardHeader>
        <CardContent><div className="h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={movementData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="received" />
              <Bar dataKey="issued" />
            </BarChart>
          </ResponsiveContainer>
        </div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Inventory value by category</CardTitle></CardHeader>
        <CardContent><div className="h-[290px]">
          {categoryData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={85} label>
                  {categoryData.map((_, index) => <Cell key={index} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="py-20 text-center text-sm text-muted-foreground">Add products to see category value.</p>}
        </div></CardContent>
      </Card>
    </div>
  );
}
