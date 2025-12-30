
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '../services/calculatorService';

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  value: number;
  subtitle: string;
  note?: string;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, icon: Icon, value, subtitle, note, colorClass 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">{title}</h3>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-slate-500">{subtitle}</p>
        <p className={`text-3xl md:text-4xl font-black ${colorClass.replace('bg-', 'text-')}`}>
          {formatCurrency(value)}
        </p>
      </div>
      {note && (
        <p className="mt-4 text-xs text-slate-400 font-medium italic border-t border-slate-50 pt-3">
          {note}
        </p>
      )}
    </div>
  );
};
