import React from "react";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <h3 className="text-3xl font-bold text-foreground">{value}</h3>
              
              {(subtitle || trend) && (
                <div className="mt-2 flex items-center gap-2">
                  {trend && (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${trend.isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}>
                      {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                    </span>
                  )}
                  {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
                </div>
              )}
            </div>
            {icon && (
              <div className="p-3 bg-muted/50 rounded-xl text-primary">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
