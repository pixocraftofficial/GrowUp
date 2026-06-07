import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";

interface CategorySectionProps {
  title: string;
  points?: number;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

export function CategorySection({ title, points, icon, children, delay = 0 }: CategorySectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-primary">{icon}</div>
              <CardTitle className="text-lg font-bold">{title}</CardTitle>
            </div>
            {points !== undefined && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {points} pts
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
