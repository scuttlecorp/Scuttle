import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, TrendingUp, Info, Shield } from 'lucide-react';
import { useLocation } from 'wouter';
import type { InsertPresale, Token } from '@shared/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const presaleFormSchema = z.object({
  tokenId: z.string().min(1, 'Token is required'),
  tokenName: z.string().min(1, 'Token name is required'),
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  pricePerToken: z.string().regex(/^\d+\.?\d*$/, 'Must be a valid price').refine((val) => parseFloat(val) > 0, 'Price must be greater than 0'),
  hardCap: z.string().regex(/^\d+\.?\d*$/, 'Must be a valid number').refine((val) => parseFloat(val) > 0, 'Hard cap must be greater than 0'),
  softCap: z.string().regex(/^\d+\.?\d*$/, 'Must be a valid number').refine((val) => parseFloat(val) > 0, 'Soft cap must be greater than 0').optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isEncrypted: z.boolean().default(true),
});

type PresaleFormValues = z.infer<typeof presaleFormSchema>;

export default function CreatePresale() {
  const { address, isConnected } = useWallet();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: tokens, isLoading: tokensLoading } = useQuery<Token[]>({
    queryKey: ['/api/tokens'],
  });

  const deployedTokens = tokens?.filter(t => t.status === 'deployed') || [];

  const form = useForm<PresaleFormValues>({
    resolver: zodResolver(presaleFormSchema),
    defaultValues: {
      tokenId: '',
      tokenName: '',
      tokenSymbol: '',
      pricePerToken: '',
      hardCap: '',
      softCap: '',
      startDate: '',
      endDate: '',
      isEncrypted: true,
    },
  });

  const createPresaleMutation = useMutation({
    mutationFn: async (data: PresaleFormValues) => {
      if (!address) throw new Error('Wallet not connected');

      const presaleData: InsertPresale = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        ownerAddress: address,
        status: 'upcoming',
      };

      return await apiRequest('POST', '/api/presales', presaleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });

      toast({
        title: 'Presale created',
        description: 'Your presale has been successfully created.',
      });

      navigate('/presales');
    },
    onError: (error: Error) => {
      toast({
        title: 'Creation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleTokenSelect = (tokenId: string) => {
    const selectedToken = tokens?.find(t => t.id === tokenId);
    if (selectedToken) {
      form.setValue('tokenName', selectedToken.name);
      form.setValue('tokenSymbol', selectedToken.symbol);
    }
  };

  const onSubmit = (data: PresaleFormValues) => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to create a presale.',
        variant: 'destructive',
      });
      return;
    }

    // Validate dates
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      toast({
        title: 'Invalid dates',
        description: 'End date must be after start date.',
        variant: 'destructive',
      });
      return;
    }

    createPresaleMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Launch Presale</h1>
            <p className="text-muted-foreground">
              Create a confidential presale for your token
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Presale Configuration</CardTitle>
              <CardDescription>Set up your token presale parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Token Selection */}
                  <FormField
                    control={form.control}
                    name="tokenId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Token</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleTokenSelect(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-token">
                              <SelectValue placeholder="Choose a token" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tokensLoading ? (
                              <SelectItem value="loading" disabled>Loading tokens...</SelectItem>
                            ) : deployedTokens.length > 0 ? (
                              deployedTokens.map((token) => (
                                <SelectItem key={token.id} value={token.id}>
                                  {token.name} ({token.symbol})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No tokens available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select a deployed token for the presale
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="pricePerToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Token (ETH)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0.001"
                            {...field}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormDescription>
                          Price in ETH for each token
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Caps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hardCap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hard Cap (ETH)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="100"
                              {...field}
                              data-testid="input-hard-cap"
                            />
                          </FormControl>
                          <FormDescription>Maximum ETH to raise</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="softCap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soft Cap (ETH) - Optional</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="10"
                              {...field}
                              data-testid="input-soft-cap"
                            />
                          </FormControl>
                          <FormDescription>Minimum ETH to raise</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Start Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              data-testid="input-start-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            End Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              data-testid="input-end-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Encryption Toggle */}
                  <FormField
                    control={form.control}
                    name="isEncrypted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-6 bg-card">
                        <div className="space-y-0.5 flex-1">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Enable Encryption
                          </FormLabel>
                          <FormDescription>
                            Keep contributions confidential using FHEVM
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-encryption"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Info Box */}
                  <div className="p-4 bg-accent/50 rounded-lg border border-accent flex gap-3">
                    <Info className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Presale Terms</p>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Participants can contribute between start and end dates</li>
                        <li>Presale ends when hard cap is reached or end date passes</li>
                        <li>Encrypted presales keep contribution amounts private</li>
                      </ul>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/presales')}
                      className="flex-1"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createPresaleMutation.isPending || !isConnected}
                      className="flex-1 gap-2"
                      data-testid="button-create-presale"
                    >
                      {createPresaleMutation.isPending ? (
                        <>Creating...</>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4" />
                          Create Presale
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
