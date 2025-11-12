import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EncryptionBadge } from '@/components/encryption-badge';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Calendar, Users, DollarSign, Plus } from 'lucide-react';
import { Link } from 'wouter';
import type { Presale } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function Presales() {
  const [activeTab, setActiveTab] = useState('all');

  const { data: presales, isLoading } = useQuery<Presale[]>({
    queryKey: ['/api/presales'],
  });

  const filteredPresales = presales?.filter((presale) => {
    if (activeTab === 'all') return true;
    return presale.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      active: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      ended: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
      finalized: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      cancelled: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    };
    return colors[status] || colors.upcoming;
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Token Presales</h1>
            <p className="text-muted-foreground">
              Browse and participate in confidential token presales
            </p>
          </div>
          <Link href="/create-presale">
            <Button className="gap-2" data-testid="button-create-presale">
              <Plus className="h-4 w-4" />
              Launch Presale
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active">Active</TabsTrigger>
            <TabsTrigger value="ended" data-testid="tab-ended">Ended</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-2 w-full mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPresales && filteredPresales.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPresales.map((presale) => (
                  <Card key={presale.id} className="hover-elevate transition-all" data-testid={`presale-${presale.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{presale.tokenName}</CardTitle>
                          <CardDescription className="font-mono">{presale.tokenSymbol}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <EncryptionBadge status={presale.isEncrypted ? 'encrypted' : 'public'} />
                          <Badge variant="outline" className={getStatusColor(presale.status)}>
                            {presale.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {((Number(presale.totalRaised) / Number(presale.hardCap)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min((Number(presale.totalRaised) / Number(presale.hardCap)) * 100, 100)}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{presale.totalRaised} ETH</span>
                            <span>{presale.hardCap} ETH</span>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                              <DollarSign className="h-3 w-3" />
                              Price
                            </div>
                            <div className="font-medium text-sm">{presale.pricePerToken} ETH</div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                              <Users className="h-3 w-3" />
                              Participants
                            </div>
                            <div className="font-medium text-sm">{presale.participantCount}</div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="space-y-2 pt-2 border-t text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Start
                            </span>
                            <span className="font-mono">{format(new Date(presale.startDate), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              End
                            </span>
                            <span className="font-mono">{format(new Date(presale.endDate), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Link href={`/presales/${presale.id}`}>
                          <Button className="w-full" variant={presale.status === 'active' ? 'default' : 'outline'} data-testid={`button-view-${presale.id}`}>
                            {presale.status === 'active' ? 'Participate' : 'View Details'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No presales found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === 'all' 
                      ? 'Be the first to launch a presale' 
                      : `No ${activeTab} presales at the moment`
                    }
                  </p>
                  <Link href="/create-presale">
                    <Button data-testid="button-empty-create-presale">Launch Presale</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
