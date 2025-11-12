import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ChevronLeft, ChevronRight, Rocket, Shield, Info } from 'lucide-react';
import { useLocation } from 'wouter';
import type { InsertToken } from '@shared/schema';

const tokenFormSchema = z.object({
  name: z.string().min(1, 'Token name is required').max(50, 'Name too long'),
  symbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol too long').regex(/^[A-Z]+$/, 'Symbol must be uppercase letters only'),
  totalSupply: z.string().regex(/^\d+$/, 'Must be a valid number').refine((val) => BigInt(val) > 0, 'Supply must be greater than 0'),
  isEncrypted: z.boolean().default(true),
  network: z.string().default('sepolia'),
});

type TokenFormValues = z.infer<typeof tokenFormSchema>;

const steps = [
  { id: 1, title: 'Details', description: 'Basic token information' },
  { id: 2, title: 'Supply', description: 'Token supply configuration' },
  { id: 3, title: 'Encryption', description: 'Privacy settings' },
  { id: 4, title: 'Deploy', description: 'Review and deploy' },
];

export default function CreateToken() {
  const [currentStep, setCurrentStep] = useState(1);
  const { address, isConnected } = useWallet();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const form = useForm<TokenFormValues>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      name: '',
      symbol: '',
      totalSupply: '',
      isEncrypted: true,
      network: 'sepolia',
    },
  });

  const createTokenMutation = useMutation({
    mutationFn: async (data: TokenFormValues) => {
      if (!address) throw new Error('Wallet not connected');
      
      const tokenData: InsertToken = {
        ...data,
        creatorAddress: address,
        status: 'deploying',
      };

      return await apiRequest('POST', '/api/tokens', tokenData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: 'Token deployment initiated',
        description: 'Your confidential token is being deployed to the blockchain.',
      });
      
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Deployment failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await form.trigger(['name', 'symbol']);
        break;
      case 2:
        isValid = await form.trigger(['totalSupply']);
        break;
      case 3:
        isValid = await form.trigger(['isEncrypted']);
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: TokenFormValues) => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to deploy a token.',
        variant: 'destructive',
      });
      return;
    }
    createTokenMutation.mutate(data);
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Confidential Token</h1>
            <p className="text-muted-foreground">
              Launch your privacy-preserving ERC-20 token with FHEVM
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center ${step.id < steps.length ? 'mr-2' : ''}`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-colors ${
                      step.id <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className={`text-sm font-medium ${step.id === currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-token-creation" />
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Details */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Token Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="My Confidential Token"
                                {...field}
                                data-testid="input-token-name"
                              />
                            </FormControl>
                            <FormDescription>
                              The full name of your token (e.g., "Bitcoin", "Ethereum")
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="symbol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Token Symbol</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="MCT"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                data-testid="input-token-symbol"
                              />
                            </FormControl>
                            <FormDescription>
                              Uppercase ticker symbol (e.g., "BTC", "ETH")
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: Supply */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="totalSupply"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Supply</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="1000000"
                                {...field}
                                data-testid="input-total-supply"
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum number of tokens that will ever exist
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="p-4 bg-accent/50 rounded-lg border border-accent flex gap-3">
                        <Info className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium mb-1">Important</p>
                          <p className="text-muted-foreground">
                            The total supply is fixed and cannot be changed after deployment. Make sure to set the correct amount.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Encryption */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
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
                                Use FHEVM to keep token balances and transfers confidential on-chain
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

                      <div className="space-y-3 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Encryption Features
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                            <span>Token balances encrypted using Fully Homomorphic Encryption</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                            <span>Transfer amounts remain confidential on-chain</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                            <span>Only authorized parties can decrypt their own balance</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-4 p-6 bg-muted rounded-lg">
                        <h4 className="font-semibold text-lg">Review Your Token</h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground mb-1">Name</div>
                            <div className="font-medium" data-testid="review-name">{form.watch('name')}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Symbol</div>
                            <div className="font-medium font-mono" data-testid="review-symbol">{form.watch('symbol')}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Total Supply</div>
                            <div className="font-medium" data-testid="review-supply">
                              {Number(form.watch('totalSupply')).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Encryption</div>
                            <div className="font-medium" data-testid="review-encryption">
                              {form.watch('isEncrypted') ? '🔒 Enabled' : '👁️ Disabled'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex gap-3">
                          <Rocket className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium mb-1 text-primary">Ready to Deploy</p>
                            <p className="text-muted-foreground">
                              Your token will be deployed to {form.watch('network')}. Make sure your wallet is connected and has sufficient funds for gas fees.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1 || createTokenMutation.isPending}
                      data-testid="button-back"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

                    {currentStep < steps.length ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        data-testid="button-next"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={createTokenMutation.isPending || !isConnected}
                        data-testid="button-deploy-token"
                      >
                        {createTokenMutation.isPending ? (
                          <>Deploying...</>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4 mr-2" />
                            Deploy Token
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Help Sidebar (Desktop) */}
          <Card className="mt-6 hidden lg:block">
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Token deployment requires a connected wallet</p>
              <p>• Ensure you have enough ETH for gas fees</p>
              <p>• Encrypted tokens use FHEVM for privacy</p>
              <p>• Total supply cannot be changed after deployment</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
