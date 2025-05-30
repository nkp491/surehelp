import { Settings, Phone, Calendar, MessageSquare, Target, TrendingUp, Users, DollarSign, ChevronDown, ChevronUp, Plus, Minus, X, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

// Add new type definitions
type TimeRange = 'weekly' | 'monthly' | 'ytd';
type Metrics = {
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
  ap: number;
  conversion: number;
  ratios: {
    leadToContact: number;
    leadToScheduled: number;
    leadToSits: number;
    leadToSales: number;
    apPerLead: number;
    contactToScheduled: number;
    contactToSits: number;
    callsToContact: number;
    callsToScheduled: number;
    callsToSits: number;
    callsToSales: number;
    apPerCall: number;
    contactToSales: number;
    apPerContact: number;
    scheduledToSits: number;
    sitsToSales: number;
    apPerSit: number;
    apPerSale: number;
  };
};

const ManagerDashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [isRemoveAgentModalOpen, setIsRemoveAgentModalOpen] = useState(false);
  const [agentToRemove, setAgentToRemove] = useState<{ name: string; team: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [timeRange, setTimeRange] = useState<TimeRange>('ytd');
  const [sortBy, setSortBy] = useState<{
    field: string;
    direction: 'asc' | 'desc';
  }>({ field: 'name', direction: 'asc' });
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterMetrics, setFilterMetrics] = useState<{
    conversion: { min: number; max: number };
    ap: { min: number; max: number };
  }>({
    conversion: { min: 0, max: 100 },
    ap: { min: 0, max: 5000 }
  });
  const [newAgent, setNewAgent] = useState({
    name: '',
    role: '',
    team: ''
  });

  const teamAgents = {
    "Alpha Team": [
      {
        name: "Sarah Johnson",
        role: "Manager",
        metrics: {
          leads: 45,
          calls: 38,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 71,
            leadToScheduled: 33,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 53,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 84,
            callsToScheduled: 39,
            callsToSits: 32,
            callsToSales: 21,
            apPerCall: 63,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Michael Chen",
        role: "Agent",
        metrics: {
          leads: 38,
          calls: 32,
          contacts: 28,
          scheduled: 12,
          sits: 10,
          sales: 6,
          ap: 1800,
          conversion: 40,
          ratios: {
            leadToContact: 74,
            leadToScheduled: 32,
            leadToSits: 26,
            leadToSales: 16,
            apPerLead: 47,
            contactToScheduled: 43,
            contactToSits: 36,
            callsToContact: 88,
            callsToScheduled: 38,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 56,
            contactToSales: 21,
            apPerContact: 64,
            scheduledToSits: 83,
            sitsToSales: 60,
            apPerSit: 180,
            apPerSale: 300
          }
        }
      },
      {
        name: "Lisa Thompson",
        role: "Agent",
        metrics: {
          leads: 42,
          calls: 36,
          contacts: 30,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 63,
          ratios: {
            leadToContact: 71,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 17,
            apPerLead: 50,
            contactToScheduled: 47,
            contactToSits: 37,
            callsToContact: 83,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 70,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "David Kim",
        role: "Manager",
        metrics: {
          leads: 48,
          calls: 40,
          contacts: 34,
          scheduled: 16,
          sits: 13,
          sales: 9,
          ap: 2700,
          conversion: 69,
          ratios: {
            leadToContact: 71,
            leadToScheduled: 33,
            leadToSits: 27,
            leadToSales: 19,
            apPerLead: 56,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 85,
            callsToScheduled: 40,
            callsToSits: 33,
            callsToSales: 23,
            apPerCall: 68,
            contactToSales: 26,
            apPerContact: 79,
            scheduledToSits: 81,
            sitsToSales: 69,
            apPerSit: 208,
            apPerSale: 300
          }
        }
      },
      {
        name: "Rachel Martinez",
        role: "Agent",
        metrics: {
          leads: 40,
          calls: 34,
          contacts: 29,
          scheduled: 13,
          sits: 10,
          sales: 6,
          ap: 1800,
          conversion: 60,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 33,
            leadToSits: 25,
            leadToSales: 15,
            apPerLead: 45,
            contactToScheduled: 45,
            contactToSits: 34,
            callsToContact: 85,
            callsToScheduled: 38,
            callsToSits: 29,
            callsToSales: 18,
            apPerCall: 53,
            contactToSales: 21,
            apPerContact: 62,
            scheduledToSits: 77,
            sitsToSales: 60,
            apPerSit: 180,
            apPerSale: 300
          }
        }
      },
      {
        name: "Jason Wright",
        role: "Agent",
        metrics: {
          leads: 43,
          calls: 36,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 65,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 16,
            apPerLead: 49,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 86,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Emma Davis",
        role: "Agent",
        metrics: {
          leads: 41,
          calls: 35,
          contacts: 30,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 63,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 17,
            apPerLead: 51,
            contactToScheduled: 47,
            contactToSits: 37,
            callsToContact: 86,
            callsToScheduled: 40,
            callsToSits: 31,
            callsToSales: 20,
            apPerCall: 60,
            contactToSales: 23,
            apPerContact: 70,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      }
    ],
    "Beta Team": [
      {
        name: "James Wilson",
        role: "Agent",
        metrics: {
          leads: 41,
          calls: 35,
          contacts: 30,
          scheduled: 16,
          sits: 12,
          sales: 7,
          ap: 2100,
          conversion: 70,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 39,
            leadToSits: 29,
            leadToSales: 17,
            apPerLead: 51,
            contactToScheduled: 53,
            contactToSits: 40,
            callsToContact: 86,
            callsToScheduled: 46,
            callsToSits: 34,
            callsToSales: 20,
            apPerCall: 60,
            contactToSales: 23,
            apPerContact: 70,
            scheduledToSits: 75,
            sitsToSales: 58,
            apPerSit: 175,
            apPerSale: 300
          }
        }
      },
      {
        name: "Emily Rodriguez",
        role: "Agent",
        metrics: {
          leads: 52,
          calls: 44,
          contacts: 36,
          scheduled: 14,
          sits: 8,
          sales: 4,
          ap: 1200,
          conversion: 50,
          ratios: {
            leadToContact: 69,
            leadToScheduled: 27,
            leadToSits: 15,
            leadToSales: 8,
            apPerLead: 23,
            contactToScheduled: 39,
            contactToSits: 22,
            callsToContact: 82,
            callsToScheduled: 32,
            callsToSits: 18,
            callsToSales: 9,
            apPerCall: 27,
            contactToSales: 11,
            apPerContact: 33,
            scheduledToSits: 57,
            sitsToSales: 50,
            apPerSit: 150,
            apPerSale: 300
          }
        }
      },
      {
        name: "Alex Turner",
        role: "Agent",
        metrics: {
          leads: 39,
          calls: 33,
          contacts: 28,
          scheduled: 13,
          sits: 9,
          sales: 5,
          ap: 1500,
          conversion: 55,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 23,
            leadToSales: 13,
            apPerLead: 38,
            contactToScheduled: 46,
            contactToSits: 32,
            callsToContact: 85,
            callsToScheduled: 39,
            callsToSits: 27,
            callsToSales: 15,
            apPerCall: 45,
            contactToSales: 18,
            apPerContact: 54,
            scheduledToSits: 69,
            sitsToSales: 56,
            apPerSit: 167,
            apPerSale: 300
          }
        }
      },
      {
        name: "Sophie Clark",
        role: "Manager",
        metrics: {
          leads: 44,
          calls: 37,
          contacts: 31,
          scheduled: 15,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 64,
          ratios: {
            leadToContact: 70,
            leadToScheduled: 34,
            leadToSits: 25,
            leadToSales: 16,
            apPerLead: 48,
            contactToScheduled: 48,
            contactToSits: 35,
            callsToContact: 84,
            callsToScheduled: 41,
            callsToSits: 30,
            callsToSales: 19,
            apPerCall: 57,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 73,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Ryan Cooper",
        role: "Agent",
        metrics: {
          leads: 44,
          calls: 37,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 55,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 86,
            callsToScheduled: 41,
            callsToSits: 32,
            callsToSales: 22,
            apPerCall: 65,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Olivia Martinez",
        role: "Agent",
        metrics: {
          leads: 42,
          calls: 36,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 64,
          ratios: {
            leadToContact: 74,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 17,
            apPerLead: 50,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 86,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      }
    ],
    "Gamma Team": [
      {
        name: "John Anderson",
        role: "Agent",
        metrics: {
          leads: 43,
          calls: 36,
          contacts: 31,
          scheduled: 14,
          sits: 10,
          sales: 6,
          ap: 1800,
          conversion: 60,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 23,
            leadToSales: 14,
            apPerLead: 42,
            contactToScheduled: 45,
            contactToSits: 32,
            callsToContact: 86,
            callsToScheduled: 39,
            callsToSits: 28,
            callsToSales: 17,
            apPerCall: 50,
            contactToSales: 19,
            apPerContact: 58,
            scheduledToSits: 71,
            sitsToSales: 60,
            apPerSit: 180,
            apPerSale: 300
          }
        }
      },
      {
        name: "Maria Garcia",
        role: "Manager",
        metrics: {
          leads: 47,
          calls: 40,
          contacts: 34,
          scheduled: 16,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 34,
            leadToSits: 26,
            leadToSales: 17,
            apPerLead: 51,
            contactToScheduled: 47,
            contactToSits: 35,
            callsToContact: 85,
            callsToScheduled: 40,
            callsToSits: 30,
            callsToSales: 20,
            apPerCall: 60,
            contactToSales: 24,
            apPerContact: 71,
            scheduledToSits: 75,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Tom Lee",
        role: "Agent",
        metrics: {
          leads: 40,
          calls: 34,
          contacts: 29,
          scheduled: 13,
          sits: 9,
          sales: 5,
          ap: 1500,
          conversion: 56,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 33,
            leadToSits: 23,
            leadToSales: 13,
            apPerLead: 38,
            contactToScheduled: 45,
            contactToSits: 31,
            callsToContact: 85,
            callsToScheduled: 38,
            callsToSits: 26,
            callsToSales: 15,
            apPerCall: 44,
            contactToSales: 17,
            apPerContact: 52,
            scheduledToSits: 69,
            sitsToSales: 56,
            apPerSit: 167,
            apPerSale: 300
          }
        }
      },
      {
        name: "Anna White",
        role: "Agent",
        metrics: {
          leads: 38,
          calls: 32,
          contacts: 27,
          scheduled: 12,
          sits: 8,
          sales: 4,
          ap: 1200,
          conversion: 50,
          ratios: {
            leadToContact: 71,
            leadToScheduled: 32,
            leadToSits: 21,
            leadToSales: 11,
            apPerLead: 32,
            contactToScheduled: 44,
            contactToSits: 30,
            callsToContact: 84,
            callsToScheduled: 38,
            callsToSits: 25,
            callsToSales: 13,
            apPerCall: 38,
            contactToSales: 15,
            apPerContact: 44,
            scheduledToSits: 67,
            sitsToSales: 50,
            apPerSit: 150,
            apPerSale: 300
          }
        }
      },
      {
        name: "Chris Taylor",
        role: "Agent",
        metrics: {
          leads: 41,
          calls: 35,
          contacts: 30,
          scheduled: 14,
          sits: 10,
          sales: 6,
          ap: 1800,
          conversion: 60,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 24,
            leadToSales: 15,
            apPerLead: 44,
            contactToScheduled: 47,
            contactToSits: 33,
            callsToContact: 86,
            callsToScheduled: 40,
            callsToSits: 29,
            callsToSales: 17,
            apPerCall: 51,
            contactToSales: 20,
            apPerContact: 60,
            scheduledToSits: 71,
            sitsToSales: 60,
            apPerSit: 180,
            apPerSale: 300
          }
        }
      },
      {
        name: "Kelly Brown",
        role: "Agent",
        metrics: {
          leads: 39,
          calls: 33,
          contacts: 28,
          scheduled: 13,
          sits: 9,
          sales: 5,
          ap: 1500,
          conversion: 56,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 23,
            leadToSales: 13,
            apPerLead: 38,
            contactToScheduled: 46,
            contactToSits: 32,
            callsToContact: 85,
            callsToScheduled: 39,
            callsToSits: 27,
            callsToSales: 15,
            apPerCall: 45,
            contactToSales: 18,
            apPerContact: 54,
            scheduledToSits: 69,
            sitsToSales: 56,
            apPerSit: 167,
            apPerSale: 300
          }
        }
      },
      {
        name: "Lucas Kim",
        role: "Agent",
        metrics: {
          leads: 45,
          calls: 38,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 71,
            leadToScheduled: 33,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 53,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 84,
            callsToScheduled: 39,
            callsToSits: 32,
            callsToSales: 21,
            apPerCall: 63,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Isabella Santos",
        role: "Agent",
        metrics: {
          leads: 41,
          calls: 35,
          contacts: 30,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 64,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 17,
            apPerLead: 51,
            contactToScheduled: 47,
            contactToSits: 37,
            callsToContact: 86,
            callsToScheduled: 40,
            callsToSits: 31,
            callsToSales: 20,
            apPerCall: 60,
            contactToSales: 23,
            apPerContact: 70,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      }
    ],
    "Delta Team": [
      {
        name: "Robert Foster",
        role: "Manager",
        metrics: {
          leads: 46,
          calls: 39,
          contacts: 33,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 66,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 17,
            apPerLead: 52,
            contactToScheduled: 45,
            contactToSits: 36,
            callsToContact: 85,
            callsToScheduled: 38,
            callsToSits: 31,
            callsToSales: 21,
            apPerCall: 62,
            contactToSales: 24,
            apPerContact: 73,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Jennifer Wu",
        role: "Agent",
        metrics: {
          leads: 42,
          calls: 36,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 64,
          ratios: {
            leadToContact: 74,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 17,
            apPerLead: 50,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 86,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Marcus Bennett",
        role: "Agent",
        metrics: {
          leads: 39,
          calls: 33,
          contacts: 28,
          scheduled: 13,
          sits: 10,
          sales: 6,
          ap: 1800,
          conversion: 60,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 15,
            apPerLead: 46,
            contactToScheduled: 46,
            contactToSits: 36,
            callsToContact: 85,
            callsToScheduled: 39,
            callsToSits: 30,
            callsToSales: 18,
            apPerCall: 55,
            contactToSales: 21,
            apPerContact: 64,
            scheduledToSits: 77,
            sitsToSales: 60,
            apPerSit: 180,
            apPerSale: 300
          }
        }
      },
      {
        name: "Sophia Patel",
        role: "Agent",
        metrics: {
          leads: 44,
          calls: 37,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 55,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 86,
            callsToScheduled: 41,
            callsToSits: 32,
            callsToSales: 22,
            apPerCall: 65,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Nathan Chen",
        role: "Agent",
        metrics: {
          leads: 43,
          calls: 37,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 63,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 16,
            apPerLead: 49,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 84,
            callsToScheduled: 38,
            callsToSits: 30,
            callsToSales: 19,
            apPerCall: 57,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Sophia Lee",
        role: "Agent",
        metrics: {
          leads: 44,
          calls: 37,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 55,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 86,
            callsToScheduled: 41,
            callsToSits: 32,
            callsToSales: 22,
            apPerCall: 65,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      }
    ],
    "Epsilon Team": [
      {
        name: "Daniel Park",
        role: "Manager",
        metrics: {
          leads: 48,
          calls: 41,
          contacts: 35,
          scheduled: 16,
          sits: 13,
          sales: 9,
          ap: 2700,
          conversion: 69,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 33,
            leadToSits: 27,
            leadToSales: 19,
            apPerLead: 56,
            contactToScheduled: 46,
            contactToSits: 37,
            callsToContact: 85,
            callsToScheduled: 39,
            callsToSits: 32,
            callsToSales: 22,
            apPerCall: 66,
            contactToSales: 26,
            apPerContact: 77,
            scheduledToSits: 81,
            sitsToSales: 69,
            apPerSit: 208,
            apPerSale: 300
          }
        }
      },
      {
        name: "Rachel Cohen",
        role: "Agent",
        metrics: {
          leads: 41,
          calls: 35,
          contacts: 30,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 64,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 17,
            apPerLead: 51,
            contactToScheduled: 47,
            contactToSits: 37,
            callsToContact: 86,
            callsToScheduled: 40,
            callsToSits: 31,
            callsToSales: 20,
            apPerCall: 60,
            contactToSales: 23,
            apPerContact: 70,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Kevin O'Brien",
        role: "Agent",
        metrics: {
          leads: 43,
          calls: 37,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 63,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 16,
            apPerLead: 49,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 84,
            callsToScheduled: 38,
            callsToSits: 30,
            callsToSales: 19,
            apPerCall: 57,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "William Taylor",
        role: "Agent",
        metrics: {
          leads: 42,
          calls: 36,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 64,
          ratios: {
            leadToContact: 74,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 17,
            apPerLead: 50,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 86,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Ava Rodriguez",
        role: "Agent",
        metrics: {
          leads: 45,
          calls: 38,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 71,
            leadToScheduled: 33,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 53,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 84,
            callsToScheduled: 39,
            callsToSits: 32,
            callsToSales: 21,
            apPerCall: 63,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      }
    ],
    "Zeta Team": [
      {
        name: "Amanda Torres",
        role: "Manager",
        metrics: {
          leads: 45,
          calls: 38,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 71,
            leadToScheduled: 33,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 53,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 84,
            callsToScheduled: 39,
            callsToSits: 32,
            callsToSales: 21,
            apPerCall: 63,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Brian Murphy",
        role: "Agent",
        metrics: {
          leads: 40,
          calls: 34,
          contacts: 29,
          scheduled: 13,
          sits: 10,
          sales: 6,
          ap: 1800,
          conversion: 60,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 33,
            leadToSits: 25,
            leadToSales: 15,
            apPerLead: 45,
            contactToScheduled: 45,
            contactToSits: 34,
            callsToContact: 85,
            callsToScheduled: 38,
            callsToSits: 29,
            callsToSales: 18,
            apPerCall: 53,
            contactToSales: 21,
            apPerContact: 62,
            scheduledToSits: 77,
            sitsToSales: 60,
            apPerSit: 180,
            apPerSale: 300
          }
        }
      },
      {
        name: "Michelle Wong",
        role: "Agent",
        metrics: {
          leads: 42,
          calls: 36,
          contacts: 30,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 64,
          ratios: {
            leadToContact: 71,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 17,
            apPerLead: 50,
            contactToScheduled: 47,
            contactToSits: 37,
            callsToContact: 83,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 70,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Ethan Wilson",
        role: "Agent",
        metrics: {
          leads: 43,
          calls: 36,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 65,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 16,
            apPerLead: 49,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 86,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Mia Thompson",
        role: "Agent",
        metrics: {
          leads: 41,
          calls: 35,
          contacts: 30,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 63,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 17,
            apPerLead: 51,
            contactToScheduled: 47,
            contactToSits: 37,
            callsToContact: 86,
            callsToScheduled: 40,
            callsToSits: 31,
            callsToSales: 20,
            apPerCall: 60,
            contactToSales: 23,
            apPerContact: 70,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      }
    ],
    "Theta Team": [
      {
        name: "Victoria Chang",
        role: "Manager",
        metrics: {
          leads: 46,
          calls: 39,
          contacts: 33,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 68,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 17,
            apPerLead: 52,
            contactToScheduled: 45,
            contactToSits: 36,
            callsToContact: 85,
            callsToScheduled: 38,
            callsToSits: 31,
            callsToSales: 21,
            apPerCall: 62,
            contactToSales: 24,
            apPerContact: 73,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Adrian Foster",
        role: "Agent",
        metrics: {
          leads: 43,
          calls: 36,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 65,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 16,
            apPerLead: 49,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 86,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Nina Patel",
        role: "Agent",
        metrics: {
          leads: 44,
          calls: 37,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 55,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 86,
            callsToScheduled: 41,
            callsToSits: 32,
            callsToSales: 22,
            apPerCall: 65,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Jordan Hayes",
        role: "Agent",
        metrics: {
          leads: 41,
          calls: 35,
          contacts: 30,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 64,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 17,
            apPerLead: 51,
            contactToScheduled: 47,
            contactToSits: 37,
            callsToContact: 86,
            callsToScheduled: 40,
            callsToSits: 31,
            callsToSales: 20,
            apPerCall: 60,
            contactToSales: 23,
            apPerContact: 70,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Cameron Ross",
        role: "Agent",
        metrics: {
          leads: 42,
          calls: 36,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 64,
          ratios: {
            leadToContact: 74,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 17,
            apPerLead: 50,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 86,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Morgan Silva",
        role: "Agent",
        metrics: {
          leads: 45,
          calls: 38,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 71,
            leadToScheduled: 33,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 53,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 84,
            callsToScheduled: 39,
            callsToSits: 32,
            callsToSales: 21,
            apPerCall: 63,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Taylor Reed",
        role: "Agent",
        metrics: {
          leads: 43,
          calls: 37,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 63,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 16,
            apPerLead: 49,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 84,
            callsToScheduled: 38,
            callsToSits: 30,
            callsToSales: 19,
            apPerCall: 57,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      }
    ],
    "Iota Team": [
      {
        name: "Samuel Park",
        role: "Manager",
        metrics: {
          leads: 47,
          calls: 40,
          contacts: 34,
          scheduled: 16,
          sits: 13,
          sales: 9,
          ap: 2700,
          conversion: 69,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 34,
            leadToSits: 28,
            leadToSales: 19,
            apPerLead: 57,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 85,
            callsToScheduled: 40,
            callsToSits: 33,
            callsToSales: 23,
            apPerCall: 68,
            contactToSales: 26,
            apPerContact: 79,
            scheduledToSits: 81,
            sitsToSales: 69,
            apPerSit: 208,
            apPerSale: 300
          }
        }
      },
      {
        name: "Riley Morgan",
        role: "Agent",
        metrics: {
          leads: 42,
          calls: 36,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 64,
          ratios: {
            leadToContact: 74,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 17,
            apPerLead: 50,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 86,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Casey Zhang",
        role: "Agent",
        metrics: {
          leads: 44,
          calls: 37,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 55,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 86,
            callsToScheduled: 41,
            callsToSits: 32,
            callsToSales: 22,
            apPerCall: 65,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      },
      {
        name: "Drew Campbell",
        role: "Agent",
        metrics: {
          leads: 43,
          calls: 36,
          contacts: 31,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 65,
          ratios: {
            leadToContact: 72,
            leadToScheduled: 33,
            leadToSits: 26,
            leadToSales: 16,
            apPerLead: 49,
            contactToScheduled: 45,
            contactToSits: 35,
            callsToContact: 86,
            callsToScheduled: 39,
            callsToSits: 31,
            callsToSales: 19,
            apPerCall: 58,
            contactToSales: 23,
            apPerContact: 68,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Avery Nguyen",
        role: "Agent",
        metrics: {
          leads: 41,
          calls: 35,
          contacts: 30,
          scheduled: 14,
          sits: 11,
          sales: 7,
          ap: 2100,
          conversion: 63,
          ratios: {
            leadToContact: 73,
            leadToScheduled: 34,
            leadToSits: 27,
            leadToSales: 17,
            apPerLead: 51,
            contactToScheduled: 47,
            contactToSits: 37,
            callsToContact: 86,
            callsToScheduled: 40,
            callsToSits: 31,
            callsToSales: 20,
            apPerCall: 60,
            contactToSales: 23,
            apPerContact: 70,
            scheduledToSits: 79,
            sitsToSales: 64,
            apPerSit: 191,
            apPerSale: 300
          }
        }
      },
      {
        name: "Jamie Collins",
        role: "Agent",
        metrics: {
          leads: 45,
          calls: 38,
          contacts: 32,
          scheduled: 15,
          sits: 12,
          sales: 8,
          ap: 2400,
          conversion: 67,
          ratios: {
            leadToContact: 71,
            leadToScheduled: 33,
            leadToSits: 27,
            leadToSales: 18,
            apPerLead: 53,
            contactToScheduled: 47,
            contactToSits: 38,
            callsToContact: 84,
            callsToScheduled: 39,
            callsToSits: 32,
            callsToSales: 21,
            apPerCall: 63,
            contactToSales: 25,
            apPerContact: 75,
            scheduledToSits: 80,
            sitsToSales: 67,
            apPerSit: 200,
            apPerSale: 300
          }
        }
      }
    ]
  };

  const teams = [
    {
      name: "Alpha Team",
      members: 7,
      performance: 92
    },
    {
      name: "Beta Team",
      members: 6,
      performance: 87
    },
    {
      name: "Gamma Team",
      members: 8,
      performance: 78
    },
    {
      name: "Delta Team",
      members: 6,
      performance: 85
    },
    {
      name: "Epsilon Team",
      members: 5,
      performance: 82
    },
    {
      name: "Zeta Team",
      members: 5,
      performance: 80
    },
    {
      name: "Theta Team",
      members: 7,
      performance: 84
    },
    {
      name: "Iota Team",
      members: 6,
      performance: 83
    }
  ];

  const notes = [
    {
      agent: "Sarah Johnson",
      date: "2024-03-15",
      summary: "Discussed Q1 performance. Exceeding targets in all areas. Planning advanced training for team leadership. Set goal to improve sits-to-sales ratio by 5% next quarter."
    },
    {
      agent: "Michael Chen",
      date: "2024-03-14",
      summary: "Review of client acquisition strategy. Need to focus on follow-up consistency. Identified opportunity to improve scheduling efficiency. Will implement new CRM workflow."
    },
    {
      agent: "Emily Rodriguez",
      date: "2024-03-13",
      summary: "Monthly performance review. Strong conversion rates but needs improvement in initial contact rates. Set up weekly check-ins for next month to monitor progress."
    },
    {
      agent: "David Kim",
      date: "2024-03-12",
      summary: "Career development discussion. Interested in team lead position. Created 90-day action plan focusing on leadership skills and mentoring junior agents."
    },
    {
      agent: "Sarah Johnson",
      date: "2024-03-10",
      summary: "Weekly check-in. Discussed challenges with recent difficult client case. Provided strategies for handling objections. Reviewed successful closes from past week."
    },
    {
      agent: "Michael Chen",
      date: "2024-03-09",
      summary: "Pipeline review. Strong potential in current leads. Discussed time management techniques to improve contact rates. Set daily goals for client touchpoints."
    },
    {
      agent: "Lisa Thompson",
      date: "2024-03-08",
      summary: "Quarterly review. Outstanding performance in AP per sale. Sharing best practices with team. Discussed expansion of territory coverage."
    },
    {
      agent: "Emily Rodriguez",
      date: "2024-03-07",
      summary: "Training follow-up. Successfully implementing new sales techniques. Seeing improvement in conversion rates. Scheduled advanced product training for next week."
    },
    {
      agent: "David Kim",
      date: "2024-03-06",
      summary: "Goal setting session. Established targets for Q2. Focus on increasing average premium per policy. Created action plan for reaching out to existing clients."
    },
    {
      agent: "Sarah Johnson",
      date: "2024-03-05",
      summary: "Strategy meeting. Reviewed success with recent marketing campaign. Planning to scale approach across team. Discussed upcoming product launch preparation."
    },
    {
      agent: "James Wilson",
      date: "2024-03-15",
      summary: "Weekly performance review. Strong improvement in lead conversion. Implementing new follow-up system showing positive results. Discussed expansion of referral network."
    },
    {
      agent: "Sophie Clark",
      date: "2024-03-14",
      summary: "Leadership strategy session. Reviewing team metrics and identifying growth opportunities. Created action plan for improving team's sits-to-sales ratio."
    },
    {
      agent: "Alex Turner",
      date: "2024-03-13",
      summary: "Training assessment. Making good progress with new sales approach. Need to work on objection handling. Scheduled role-play session for next week."
    },
    {
      agent: "James Wilson",
      date: "2024-03-11",
      summary: "Pipeline analysis. Strong potential in current lead pool. Developed strategy for prioritizing high-value prospects. Set new targets for AP per sale."
    },
    {
      agent: "Sophie Clark",
      date: "2024-03-10",
      summary: "Quarterly planning session. Team exceeding conversion targets. Developed new training program for junior agents. Discussed upcoming territory expansion."
    },
    {
      agent: "Alex Turner",
      date: "2024-03-08",
      summary: "Performance check-in. Showing improvement in contact rates. Created personalized script for cold calls. Set daily activity goals for next two weeks."
    },
    {
      agent: "Emily Rodriguez",
      date: "2024-03-06",
      summary: "Development planning. Discussed career progression and leadership opportunities. Created skill development plan focusing on advanced sales techniques."
    },
    {
      agent: "Maria Garcia",
      date: "2024-03-15",
      summary: "Team lead strategy meeting. Reviewing department performance metrics. Implementing new coaching program for underperforming agents. Set Q2 team objectives."
    },
    {
      agent: "John Anderson",
      date: "2024-03-14",
      summary: "Monthly review. Excellent progress in lead conversion rates. Sharing successful closing techniques with team. Discussed upcoming product certification."
    },
    {
      agent: "Tom Lee",
      date: "2024-03-13",
      summary: "Performance optimization session. Analyzing call metrics and conversion funnel. Identified areas for improvement in follow-up process."
    },
    {
      agent: "Anna White",
      date: "2024-03-12",
      summary: "Onboarding progress review. Successfully completing initial training phases. Set up mentoring partnership with senior agent. Created 30-day improvement plan."
    },
    {
      agent: "Chris Taylor",
      date: "2024-03-11",
      summary: "Sales strategy meeting. Reviewing success with new market approach. Developed plan for expanding into new territory. Discussed cross-selling opportunities."
    },
    {
      agent: "Kelly Brown",
      date: "2024-03-10",
      summary: "Quarterly performance review. Meeting most targets but needs improvement in AP per sale. Created action plan for increasing premium values."
    },
    {
      agent: "Maria Garcia",
      date: "2024-03-09",
      summary: "Leadership development session. Discussing team management strategies. Planning implementation of new performance tracking system."
    },
    {
      agent: "John Anderson",
      date: "2024-03-08",
      summary: "Success planning meeting. Strong performance in client retention. Developed strategies for generating referrals. Set new goals for upcoming quarter."
    },
    {
      agent: "Tom Lee",
      date: "2024-03-07",
      summary: "Weekly check-in. Showing consistent improvement in sits-to-sales ratio. Created action plan for reaching President's Club targets."
    },
    {
      agent: "Anna White",
      date: "2024-03-06",
      summary: "Skills assessment. Making progress with sales techniques. Scheduled additional training for complex product lines. Set weekly learning objectives."
    },
    {
      agent: "Robert Foster",
      date: "2024-03-15",
      summary: "Quarterly strategy review. Team showing strong growth in conversion rates. Implementing new training program for lead qualification."
    },
    {
      agent: "Jennifer Wu",
      date: "2024-03-14",
      summary: "Performance review. Excellent progress in client retention. Developed new approach for follow-up calls showing promising results."
    },
    {
      agent: "Marcus Bennett",
      date: "2024-03-13",
      summary: "Weekly check-in. Discussed optimization of cold calling strategy. Set new targets for contact rates and scheduled appointments."
    },
    {
      agent: "Sophia Patel",
      date: "2024-03-12",
      summary: "Monthly review. Strong performance in sales closure. Sharing best practices with team members. Planning territory expansion."
    },
    {
      agent: "Daniel Park",
      date: "2024-03-15",
      summary: "Team leadership meeting. Reviewing Q1 metrics and planning Q2 objectives. Implementing new coaching framework."
    },
    {
      agent: "Rachel Cohen",
      date: "2024-03-14",
      summary: "Success metrics review. Showing consistent improvement in conversion rates. Created action plan for reaching higher AP targets."
    },
    {
      agent: "Kevin O'Brien",
      date: "2024-03-13",
      summary: "Training session follow-up. Successfully implementing new sales techniques. Scheduled advanced product knowledge workshop."
    },
    {
      agent: "Amanda Torres",
      date: "2024-03-15",
      summary: "Department strategy meeting. Analyzing team performance metrics. Planning implementation of new lead distribution system."
    },
    {
      agent: "Brian Murphy",
      date: "2024-03-14",
      summary: "Pipeline review. Strong potential in current leads. Developed strategy for high-value prospect targeting."
    },
    {
      agent: "Michelle Wong",
      date: "2024-03-13",
      summary: "Skill development session. Excellent progress in objection handling. Created personalized improvement plan for Q2."
    },
    {
      agent: "Ethan Wilson",
      date: "2024-03-15",
      summary: "Performance review. Excellent progress in sales metrics. Planning implementation of new lead management system."
    },
    {
      agent: "Mia Thompson",
      date: "2024-03-14",
      summary: "Development session. Successfully completing advanced training modules. Set new targets for Q2 performance."
    },
    {
      agent: "Jason Wright",
      date: "2024-03-15",
      summary: "Monthly performance review. Strong results in lead conversion. Implementing new follow-up strategy for improved contact rates."
    },
    {
      agent: "Emma Davis",
      date: "2024-03-14",
      summary: "Weekly check-in. Discussed optimization of sales process. Set new goals for AP per sale improvement."
    },
    {
      agent: "Ryan Cooper",
      date: "2024-03-15",
      summary: "Strategy session. Excellent progress in client acquisition. Developed new approach for high-value leads."
    },
    {
      agent: "Olivia Martinez",
      date: "2024-03-14",
      summary: "Training review. Successfully implementing advanced sales techniques. Planning territory expansion."
    },
    {
      agent: "Lucas Kim",
      date: "2024-03-15",
      summary: "Performance optimization meeting. Strong improvement in conversion metrics. Created action plan for Q2 targets."
    },
    {
      agent: "Isabella Santos",
      date: "2024-03-14",
      summary: "Development planning. Discussed career growth opportunities. Set up mentoring program with senior agents."
    },
    {
      agent: "Nathan Chen",
      date: "2024-03-15",
      summary: "Weekly review. Strong performance in lead qualification. Implementing new client retention strategies."
    },
    {
      agent: "Sophia Lee",
      date: "2024-03-14",
      summary: "Success metrics analysis. Excellent progress in sales closure rates. Planning advanced product training."
    },
    {
      agent: "William Taylor",
      date: "2024-03-15",
      summary: "Strategy meeting. Reviewing team performance metrics. Created action plan for conversion rate improvement."
    },
    {
      agent: "Ava Rodriguez",
      date: "2024-03-14",
      summary: "Quarterly planning session. Strong results in client acquisition. Developing new approach for referral generation."
    },
    {
      agent: "Ethan Wilson",
      date: "2024-03-15",
      summary: "Performance review. Excellent progress in sales metrics. Planning implementation of new lead management system."
    },
    {
      agent: "Mia Thompson",
      date: "2024-03-14",
      summary: "Development session. Successfully completing advanced training modules. Set new targets for Q2 performance."
    },
    {
      agent: "Victoria Chang",
      date: "2024-03-15",
      summary: "Team leadership review. Excellent progress in team development. Implementing new coaching strategies for performance optimization."
    },
    {
      agent: "Adrian Foster",
      date: "2024-03-14",
      summary: "Monthly performance check-in. Strong improvement in lead conversion rates. Created action plan for Q2 goals."
    },
    {
      agent: "Nina Patel",
      date: "2024-03-13",
      summary: "Strategy session. Successfully implementing new sales approach. Planning expansion of client portfolio."
    },
    {
      agent: "Jordan Hayes",
      date: "2024-03-12",
      summary: "Development review. Excellent progress in sales techniques. Set new targets for advanced certification."
    },
    {
      agent: "Cameron Ross",
      date: "2024-03-11",
      summary: "Weekly check-in. Strong performance in client retention. Developing new approach for high-value accounts."
    },
    {
      agent: "Morgan Silva",
      date: "2024-03-10",
      summary: "Success metrics analysis. Showing consistent improvement in all KPIs. Created action plan for reaching President's Club."
    },
    {
      agent: "Taylor Reed",
      date: "2024-03-09",
      summary: "Training assessment. Making excellent progress with new sales methodology. Scheduled advanced product training."
    },
    {
      agent: "Samuel Park",
      date: "2024-03-15",
      summary: "Leadership strategy meeting. Reviewing team performance and implementing new coaching framework."
    },
    {
      agent: "Riley Morgan",
      date: "2024-03-14",
      summary: "Quarterly review. Strong results in lead qualification. Planning implementation of new follow-up system."
    },
    {
      agent: "Casey Zhang",
      date: "2024-03-13",
      summary: "Performance optimization session. Excellent progress in conversion metrics. Set new goals for Q2."
    },
    {
      agent: "Drew Campbell",
      date: "2024-03-12",
      summary: "Development planning. Successfully implementing advanced sales strategies. Created action plan for skill enhancement."
    },
    {
      agent: "Avery Nguyen",
      date: "2024-03-11",
      summary: "Weekly progress review. Strong improvement in client engagement. Developing new approach for referral generation."
    },
    {
      agent: "Jamie Collins",
      date: "2024-03-10",
      summary: "Success metrics check-in. Consistently meeting performance targets. Planning territory expansion strategy."
    }
  ];

  const bulletins = [
    {
      title: "March Sales Challenge",
      date: "2024-03-01",
      content: "🏆 Team competition for highest conversion rate. Prize: Extra PTO day"
    },
    {
      title: "New Product Training",
      date: "2024-03-20",
      content: "📚 Mandatory session for all agents. 2PM in Conference Room A"
    },
    {
      title: "Customer Success Story",
      date: "2024-03-10",
      content: "🌟 Beta Team closed our biggest deal this quarter!"
    }
  ];

  // Add new helper function to generate time-based metrics
  const generateTimeBasedMetrics = (baseMetrics: Metrics): { weekly: Metrics; monthly: Metrics } => {
    const generateVariation = (value: number): { weekly: number; monthly: number } => {
      const weeklyVariation = value * (0.8 + Math.random() * 0.4); // 80-120% of base value
      const monthlyVariation = value * (0.9 + Math.random() * 0.2); // 90-110% of base value
      return {
        weekly: Math.round(weeklyVariation),
        monthly: Math.round(monthlyVariation)
      };
    };

    const generateRatioVariation = (value: number): { weekly: number; monthly: number } => {
      const weeklyVariation = Math.max(0, Math.min(100, value * (0.9 + Math.random() * 0.2)));
      const monthlyVariation = Math.max(0, Math.min(100, value * (0.95 + Math.random() * 0.1)));
      return {
        weekly: Math.round(weeklyVariation),
        monthly: Math.round(monthlyVariation)
      };
    };

    const weekly: Metrics = {
      ...baseMetrics,
      ...generateVariation(baseMetrics.leads),
      ...generateVariation(baseMetrics.calls),
      ...generateVariation(baseMetrics.contacts),
      ...generateVariation(baseMetrics.scheduled),
      ...generateVariation(baseMetrics.sits),
      ...generateVariation(baseMetrics.sales),
      ...generateVariation(baseMetrics.ap),
      ...generateRatioVariation(baseMetrics.conversion),
      ratios: Object.entries(baseMetrics.ratios).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: generateRatioVariation(value).weekly
      }), {} as Metrics['ratios'])
    };

    const monthly: Metrics = {
      ...baseMetrics,
      ...generateVariation(baseMetrics.leads),
      ...generateVariation(baseMetrics.calls),
      ...generateVariation(baseMetrics.contacts),
      ...generateVariation(baseMetrics.scheduled),
      ...generateVariation(baseMetrics.sits),
      ...generateVariation(baseMetrics.sales),
      ...generateVariation(baseMetrics.ap),
      ...generateRatioVariation(baseMetrics.conversion),
      ratios: Object.entries(baseMetrics.ratios).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: generateRatioVariation(value).monthly
      }), {} as Metrics['ratios'])
    };

    return { weekly, monthly };
  };

  // Add time-based metrics to each agent
  const enrichedTeamAgents = Object.entries(teamAgents).reduce((acc, [teamName, agents]) => ({
    ...acc,
    [teamName]: agents.map(agent => ({
      ...agent,
      timeBasedMetrics: generateTimeBasedMetrics(agent.metrics)
    }))
  }), {} as typeof teamAgents);

  const handleTeamClick = (teamName: string) => {
    if (selectedTeam === teamName) {
      setSelectedTeam(null);
    } else {
      setSelectedTeam(teamName);
    }
  };

  const handleMemberClick = (memberName: string) => {
    if (selectedMember === memberName) {
      setSelectedMember(null);
    } else {
      setSelectedMember(memberName);
      setTimeout(() => {
        const memberCard = document.getElementById(`member-full-card-${memberName.replace(/\s+/g, '-')}`);
        if (memberCard) {
          memberCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleAddAgent = (teamName: string) => {
    setNewAgent(prev => ({ ...prev, team: teamName }));
    setIsAddAgentModalOpen(true);
  };

  const handleAddAgentSubmit = () => {
    // This would typically make an API call to add the agent
    setIsAddAgentModalOpen(false);
    setNewAgent({ name: '', role: '', team: '' });
  };

  const handleRemoveAgent = (teamName: string, agentName: string) => {
    setAgentToRemove({ name: agentName, team: teamName });
    setIsRemoveAgentModalOpen(true);
  };

  const handleRemoveAgentConfirm = () => {
    if (agentToRemove) {
      // This would typically make an API call to remove the agent
      setIsRemoveAgentModalOpen(false);
      setAgentToRemove(null);
    }
  };

  // Filter and sort function for team members
  const getFilteredMembers = () => {
    let members = selectedTeam 
      ? enrichedTeamAgents[selectedTeam]
      : Object.values(enrichedTeamAgents).flat();

    // Apply search filter
    if (searchQuery) {
      members = members.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Get the appropriate metrics based on selected time range
    const getMetricsForTimeRange = (member: any) => {
      switch (timeRange) {
        case 'weekly':
          return member.timeBasedMetrics.weekly;
        case 'monthly':
          return member.timeBasedMetrics.monthly;
        default:
          return member.metrics;
      }
    };

    // Apply role filter
    if (filterRole !== 'all') {
      members = members.filter(member => member.role === filterRole);
    }

    // Apply metrics filters using time-based metrics
    members = members.filter(member => {
      const metrics = getMetricsForTimeRange(member);
      return metrics.conversion >= filterMetrics.conversion.min &&
             metrics.conversion <= filterMetrics.conversion.max &&
             metrics.ap >= filterMetrics.ap.min &&
             metrics.ap <= filterMetrics.ap.max;
    });

    // Apply sorting using time-based metrics
    members.sort((a, b) => {
      const metricsA = getMetricsForTimeRange(a);
      const metricsB = getMetricsForTimeRange(b);
      
      let comparison = 0;
      switch (sortBy.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'conversion':
          comparison = metricsA.conversion - metricsB.conversion;
          break;
        case 'ap':
          comparison = metricsA.ap - metricsB.ap;
          break;
      }
      return sortBy.direction === 'asc' ? comparison : -comparison;
    });

    return members;
  };

  // Get paginated members
  const getPaginatedMembers = () => {
    const filtered = getFilteredMembers();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return {
      members: filtered.slice(startIndex, startIndex + itemsPerPage),
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      totalMembers: filtered.length
    };
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Preview Banner */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="container mx-auto py-3 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-blue-600" />
                </span>
              </div>
              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-blue-600">
                    Preview Experience
                  </p>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Info className="h-4 w-4 text-blue-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs p-4">
                        <p className="text-sm">
                          Welcome to SureHelp's preview experience! While our team is hard at work building the full platform, we wanted to give you a sneak peek at what's coming. Feel free to explore our interactive demo with sample data.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xs text-blue-500">
                  This is a demo version with sample data. Try different views and filters to explore all features.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-blue-500 hidden sm:block">
                <span className="font-medium">Features available:</span> Time-based metrics, Filtering, Sorting, Team views
              </div>
              <span className="inline-flex items-center px-3 py-1 border border-blue-200 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                Demo Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Dashboard</h2>
            <p className="text-muted-foreground mt-1">Manage your team and monitor performance</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="w-full p-4 sm:p-6 shadow-sm bg-[#F1F1F1]">
            <div className="space-y-6">
              {/* Top Grid - Teams and Bulletin */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Teams Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">TEAMS</h2>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {teams.map((team, index) => (
                      <div key={index} className="space-y-2">
                        <div 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleTeamClick(team.name)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{team.name}</h3>
                              <p className="text-sm text-muted-foreground">{team.members} members</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-medium text-green-600">{team.performance}%</div>
                              <div className="text-sm text-muted-foreground">Growth</div>
                            </div>
                            {selectedTeam === team.name ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
        </div>
      </div>
      
                        {/* Team Members List */}
                        {selectedTeam === team.name && (
                          <div className="pl-11 space-y-2">
                            {teamAgents[team.name].map((agent, agentIndex) => (
                              <div key={agentIndex} className="space-y-2">
                                <div 
                                  id={`member-compact-card-${agent.name.replace(/\s+/g, '-')}`}
                                  className={`p-2 bg-gray-50 rounded-md flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors ${selectedMember === agent.name ? 'ring-2 ring-blue-500' : ''}`}
                                  onClick={() => handleMemberClick(agent.name)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium">
                                      {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{agent.name}</p>
                                      <p className="text-xs text-muted-foreground">{agent.role}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Success Calculator and 1:1 Notes for selected member */}
                                {selectedMember === agent.name && (
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow-sm">
                                    {/* Success Calculator Section */}
                                    <div className="space-y-4">
                                      <h3 className="text-sm font-semibold">SUCCESS CALCULATOR</h3>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <span className="text-xs font-medium">Conversion Rate</span>
                                          </div>
                                          <div className="text-lg font-bold text-green-600">{agent.metrics.conversion}%</div>
                                          <p className="text-xs text-muted-foreground">Individual Rate</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <Target className="h-4 w-4 text-blue-600" />
                                            <span className="text-xs font-medium">Success Score</span>
                                          </div>
                                          <div className="text-lg font-bold text-blue-600">
                                            {Math.round((agent.metrics.conversion / 100) * 100)}
                                          </div>
                                          <p className="text-xs text-muted-foreground">Individual Rating</p>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-between text-xs mb-1">
                                          <span>Individual Progress</span>
                                          <span>{agent.metrics.conversion}%</span>
                                        </div>
                                        <Progress value={agent.metrics.conversion} className="h-1.5" />
                                      </div>
                                    </div>

                                    {/* 1:1 Notes Section */}
                                    <div className="space-y-4">
                                      <h3 className="text-sm font-semibold">1:1 NOTES</h3>
                                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                        {notes
                                          .filter(note => note.agent === agent.name)
                                          .map((note, index) => (
                                            <div key={index} className="p-2 bg-gray-50 rounded-lg">
                                              <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium">{note.date}</span>
                                              </div>
                                              <p className="text-xs text-gray-600">{note.summary}</p>
                                            </div>
                                          ))}
                                        {notes.filter(note => note.agent === agent.name).length === 0 && (
                                          <p className="text-xs text-muted-foreground">No 1:1 notes available</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Bulletin Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold mb-6">TEAM BULLETIN</h2>
                  <div className="space-y-4">
                    {bulletins.map((bulletin, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{bulletin.title}</span>
                          <span className="text-sm text-muted-foreground">{bulletin.date}</span>
                        </div>
                        <p className="text-sm text-gray-600">{bulletin.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

              {/* Agents Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">TEAM MEMBERS</h2>
                  <div className="flex items-center space-x-2">
                    {isEditMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAgent(selectedTeam || 'All')}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Member</span>
                      </Button>
                    )}
                    <Button
                      variant={isEditMode ? "secondary" : "ghost"}
                      size="icon"
                      onClick={handleEditModeToggle}
                    >
                      {isEditMode ? (
                        <X className="h-5 w-5" />
                      ) : (
                        <Settings className="h-5 w-5" />
                      )}
              </Button>
                  </div>
          </div>
                <div className="space-y-6">
                  {/* Add filtering and search controls above Team Members section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                      <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-[200px]"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Select value={filterRole} onValueChange={setFilterRole}>
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="Agent">Agent</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Select time range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="ytd">Year to Date</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select 
                          value={itemsPerPage.toString()} 
                          onValueChange={(value) => setItemsPerPage(Number(value))}
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Items per page" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="20">20 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                            <SelectItem value="100">100 per page</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortBy(prev => ({
                          ...prev,
                          direction: prev.direction === 'asc' ? 'desc' : 'asc'
                        }))}
                      >
                        {sortBy.direction === 'asc' ? 'Sort ↑' : 'Sort ↓'}
                      </Button>
                    </div>
                  </div>

                  {/* Pagination controls */}
                  <div className="flex items-center justify-between py-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {getPaginatedMembers().members.length} of {getPaginatedMembers().totalMembers} members
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm">
                        Page {currentPage} of {getPaginatedMembers().totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(getPaginatedMembers().totalPages, prev + 1))}
                        disabled={currentPage === getPaginatedMembers().totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                  {/* Update the team members rendering to use paginated results */}
                  <div className="space-y-6">
                    {getPaginatedMembers().members.map((agent, index) => {
                      const currentMetrics = timeRange === 'weekly' 
                        ? agent.timeBasedMetrics.weekly 
                        : timeRange === 'monthly' 
                          ? agent.timeBasedMetrics.monthly 
                          : agent.metrics;

                      return (
                        <div 
                          key={index}
                          id={`member-full-card-${agent.name.replace(/\s+/g, '-')}`}
                          className={`bg-gray-50 p-4 rounded-lg relative cursor-pointer transition-all ${selectedMember === agent.name ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => handleMemberClick(agent.name)}
                        >
                          {isEditMode && (
                            <Button 
                              variant="destructive"
                              size="icon"
                              className="absolute -right-2 -top-2 h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAgent('All', agent.name);
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                {agent.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-semibold">{agent.name}</h3>
                                <p className="text-sm text-muted-foreground">{agent.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-green-600">
                                {currentMetrics.conversion}% Conversion
                              </div>
                              <Progress value={currentMetrics.conversion} className="w-24 h-2" />
                            </div>
                          </div>

                          {/* Primary Metrics */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">{currentMetrics.leads}</div>
                              <div className="text-xs text-muted-foreground">Leads</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">{currentMetrics.calls}</div>
                              <div className="text-xs text-muted-foreground">Calls</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">{currentMetrics.contacts}</div>
                              <div className="text-xs text-muted-foreground">Contacts</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">{currentMetrics.scheduled}</div>
                              <div className="text-xs text-muted-foreground">Scheduled</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">{currentMetrics.sits}</div>
                              <div className="text-xs text-muted-foreground">Sits</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">{currentMetrics.sales}</div>
                              <div className="text-xs text-muted-foreground">Sales</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg text-center col-span-2">
                              <div className="text-lg font-bold text-green-600">${currentMetrics.ap}</div>
                              <div className="text-xs text-muted-foreground">AP</div>
                            </div>
                          </div>

                          {/* Ratio Cards */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                            {/* Lead Based Ratios */}
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.leadToContact}%</div>
                              <div className="text-xs text-muted-foreground">Lead to Contact</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.leadToScheduled}%</div>
                              <div className="text-xs text-muted-foreground">Lead to Scheduled</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.leadToSits}%</div>
                              <div className="text-xs text-muted-foreground">Lead to Sits</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.leadToSales}%</div>
                              <div className="text-xs text-muted-foreground">Lead to Sales</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">${currentMetrics.ratios.apPerLead}</div>
                              <div className="text-xs text-muted-foreground">AP per Lead</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.contactToScheduled}%</div>
                              <div className="text-xs text-muted-foreground">Contact to Scheduled</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.contactToSits}%</div>
                              <div className="text-xs text-muted-foreground">Contact to Sits</div>
                            </div>

                            {/* Call Based Ratios */}
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.callsToContact}%</div>
                              <div className="text-xs text-muted-foreground">Calls to Contact</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.callsToScheduled}%</div>
                              <div className="text-xs text-muted-foreground">Calls to Scheduled</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.callsToSits}%</div>
                              <div className="text-xs text-muted-foreground">Calls to Sits</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.callsToSales}%</div>
                              <div className="text-xs text-muted-foreground">Calls to Sales</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">${currentMetrics.ratios.apPerCall}</div>
                              <div className="text-xs text-muted-foreground">AP per Call</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.contactToSales}%</div>
                              <div className="text-xs text-muted-foreground">Contact to Sales</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">${currentMetrics.ratios.apPerContact}</div>
                              <div className="text-xs text-muted-foreground">AP per Contact</div>
                            </div>

                            {/* Scheduled and Sits Based Ratios */}
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.scheduledToSits}%</div>
                              <div className="text-xs text-muted-foreground">Scheduled to Sits</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">{currentMetrics.ratios.sitsToSales}%</div>
                              <div className="text-xs text-muted-foreground">Sits to Sales</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">${currentMetrics.ratios.apPerSit}</div>
                              <div className="text-xs text-muted-foreground">AP per Sit</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">${currentMetrics.ratios.apPerSale}</div>
                              <div className="text-xs text-muted-foreground">AP per Sale</div>
                            </div>
                          </div>

                          {/* Success Calculator and 1:1 Notes */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                            {/* Success Calculator Section */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold">SUCCESS CALCULATOR</h3>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <span className="text-xs font-medium">Conversion Rate</span>
                                  </div>
                                  <div className="text-lg font-bold text-green-600">{currentMetrics.conversion}%</div>
                                  <p className="text-xs text-muted-foreground">
                                    {timeRange === 'weekly' ? 'Weekly' : timeRange === 'monthly' ? 'Monthly' : 'Year to Date'} Rate
                                  </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Target className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-medium">Success Score</span>
                                  </div>
                                  <div className="text-lg font-bold text-blue-600">
                                    {Math.round((currentMetrics.conversion / 100) * 100)}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {timeRange === 'weekly' ? 'Weekly' : timeRange === 'monthly' ? 'Monthly' : 'Year to Date'} Rating
                                  </p>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Individual Progress</span>
                                  <span>{currentMetrics.conversion}%</span>
                                </div>
                                <Progress value={currentMetrics.conversion} className="h-1.5" />
                              </div>
                            </div>

                            {/* 1:1 Notes Section */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">1:1 NOTES</h3>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {notes
                                  .filter(note => note.agent === agent.name)
                                  .map((note, index) => (
                                    <div key={index} className="p-2 bg-gray-50 rounded-lg">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">{note.date}</span>
                                      </div>
                                      <p className="text-xs text-gray-600">{note.summary}</p>
                                    </div>
                                  ))}
                                {notes.filter(note => note.agent === agent.name).length === 0 && (
                                  <p className="text-xs text-muted-foreground">No 1:1 notes available</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Agent Modal */}
      <Dialog open={isAddAgentModalOpen} onOpenChange={setIsAddAgentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>
              Enter the details for the new team member. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter agent name"
                value={newAgent.name}
                onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newAgent.role}
                onValueChange={(value) => setNewAgent(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Agency Owner">Agency Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select
                value={newAgent.team}
                onValueChange={(value) => setNewAgent(prev => ({ ...prev, team: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alpha Team">Alpha Team</SelectItem>
                  <SelectItem value="Beta Team">Beta Team</SelectItem>
                  <SelectItem value="Gamma Team">Gamma Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAgentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAgentSubmit}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Agent Confirmation Dialog */}
      <Dialog open={isRemoveAgentModalOpen} onOpenChange={setIsRemoveAgentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {agentToRemove?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveAgentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveAgentConfirm}>
              Remove Member
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;