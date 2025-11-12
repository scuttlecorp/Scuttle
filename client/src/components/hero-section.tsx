import { Button } from './ui/button';
import { Shield, Lock } from 'lucide-react';
import { Link } from 'wouter';

export function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by Zama FHEVM Protocol</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Create Confidential Tokens
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              with Encrypted Presales
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Launch privacy-preserving ERC-20 tokens and presales using Fully Homomorphic Encryption. 
            Keep balances and contributions confidential on-chain.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/create-token">
              <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-create-token-hero">
                <Lock className="h-4 w-4" />
                Create Token
              </Button>
            </Link>
            <Link href="/presales">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-launch-presale-hero">
                Launch Presale
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              { title: 'Encrypted Balances', description: 'Token balances stay private using FHE' },
              { title: 'Confidential Presales', description: 'Contributions remain hidden on-chain' },
              { title: 'Secure by Design', description: 'Military-grade homomorphic encryption' },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-card border border-card-border hover-elevate transition-all"
                data-testid={`feature-${index}`}
              >
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
