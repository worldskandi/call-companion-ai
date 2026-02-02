import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Plus, 
  DollarSign,
  Calendar,
  User,
  Building2,
  MoreHorizontal,
  ArrowRight,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Deal stages for Kanban board
const stages = [
  { id: 'lead', title: 'Lead', color: 'bg-muted' },
  { id: 'qualified', title: 'Qualifiziert', color: 'bg-primary/20' },
  { id: 'proposal', title: 'Angebot', color: 'bg-accent/20' },
  { id: 'negotiation', title: 'Verhandlung', color: 'bg-warning/20' },
  { id: 'closed', title: 'Abgeschlossen', color: 'bg-success/20' },
];

// Mock deals data
const mockDeals = [
  {
    id: '1',
    title: 'Enterprise Lizenz',
    company: 'TechStart GmbH',
    contact: 'Max Müller',
    value: 25000,
    stage: 'qualified',
    probability: 60,
    closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
  },
  {
    id: '2',
    title: 'Jahresvertrag',
    company: 'Digital Solutions AG',
    contact: 'Anna Schmidt',
    value: 48000,
    stage: 'proposal',
    probability: 75,
    closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: '3',
    title: 'Pilot-Projekt',
    company: 'CloudTech Services',
    contact: 'Thomas Weber',
    value: 8500,
    stage: 'lead',
    probability: 25,
    closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: '4',
    title: 'Premium Support',
    company: 'InnovateTech',
    contact: 'Julia Klein',
    value: 12000,
    stage: 'negotiation',
    probability: 85,
    closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: '5',
    title: 'Consulting Paket',
    company: 'StartupHub',
    contact: 'Peter Lang',
    value: 15000,
    stage: 'closed',
    probability: 100,
    closeDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
];

const Deals = () => {
  const [deals] = useState(mockDeals);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  const getStageDeals = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const getTotalPipelineValue = () => {
    return deals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const getWeightedValue = () => {
    return deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Deals
            </h1>
            <p className="text-muted-foreground">
              Verwalte deine Verkaufschancen und Pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Neuer Deal
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline-Wert</p>
                <p className="text-2xl font-bold">{formatCurrency(getTotalPipelineValue())}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gewichtet</p>
                <p className="text-2xl font-bold">{formatCurrency(getWeightedValue())}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offene Deals</p>
                <p className="text-2xl font-bold">{deals.filter(d => d.stage !== 'closed').length}</p>
              </div>
              <Target className="w-8 h-8 text-accent/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abgeschlossen</p>
                <p className="text-2xl font-bold">{deals.filter(d => d.stage === 'closed').length}</p>
              </div>
              <Badge className="bg-success/10 text-success">Diesen Monat</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Kanban Board */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-x-auto pb-4"
      >
        <div className="flex gap-4 min-w-max">
          {stages.map((stage, stageIndex) => {
            const stageDeals = getStageDeals(stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * stageIndex }}
                className="w-72 flex-shrink-0"
              >
                <Card className={`${stage.color} border-0`}>
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {stage.title}
                        <Badge variant="secondary" className="text-xs">
                          {stageDeals.length}
                        </Badge>
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(stageValue)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2 space-y-2">
                    {stageDeals.map((deal, index) => (
                      <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{deal.title}</h4>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                                  <DropdownMenuItem>Phase ändern</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Löschen</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3 h-3" />
                                {deal.company}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3" />
                                {deal.contact}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(deal.closeDate)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {deal.probability}%
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t">
                              <span className="font-semibold text-sm">
                                {formatCurrency(deal.value)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    
                    {stageDeals.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Keine Deals
                      </div>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-muted-foreground gap-2 h-8"
                    >
                      <Plus className="w-4 h-4" />
                      Deal hinzufügen
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Deals;
