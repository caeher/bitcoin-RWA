import { 
  Building2, 
  Building,
  Home,
  Warehouse,
  Coins, 
  FileText, 
  Image as ImageIcon, 
  LineChart, 
  Ship, 
  Car, 
  Plane, 
  Briefcase, 
  Boxes,
  Gem,
  Factory,
  Wheat,
  Activity,
  Smartphone,
  Cpu,
  Zap,
  Globe,
  HardDrive,
  Shield,
  Key
} from 'lucide-react';

export const getAssetIcon = (category: string, id: string = '') => {
  const cat = category?.toLowerCase() || 'other';
  
  // Create sets of icons per category for variety
  const categorySets: Record<string, any[]> = {
    real_estate: [Building2, Building, Home, Warehouse, Factory],
    commodity: [Coins, Gem, Boxes, HardDrive],
    invoice: [FileText, Briefcase, Shield],
    art: [ImageIcon, Gem, Globe],
    technology: [Cpu, Smartphone, Zap, HardDrive, Key],
    finance: [LineChart, Coins, Briefcase],
    other: [Briefcase, Boxes, Gem, Smartphone, Globe, Activity]
  };

  const set = categorySets[cat] || categorySets.other;
  
  // Use the ID to consistently pick one from the set
  if (!id) return set[0];
  
  const charSum = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return set[charSum % set.length];
};
