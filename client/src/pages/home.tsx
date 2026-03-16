import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Zap, Globe, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navigation */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight" data-testid="text-logo">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Layers size={18} strokeWidth={2.5} />
            </div>
            AppBase
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors" data-testid="link-features">Features</a>
            <a href="#components" className="hover:text-foreground transition-colors" data-testid="link-components">Components</a>
            <a href="#about" className="hover:text-foreground transition-colors" data-testid="link-about">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex" data-testid="button-login">Log in</Button>
            <Button className="rounded-full px-6" data-testid="button-get-started">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 overflow-hidden relative border-b">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-muted/50 text-muted-foreground mb-8" data-testid="badge-status">
                  <span className="flex w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Ready for Netlify Deployment
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-balance" data-testid="heading-hero">
                  Start building your next big idea.
                </h1>
                
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto" data-testid="text-hero-subtitle">
                  A perfectly structured React application ready to be customized and deployed instantly. Clean code, beautiful components, and zero configuration required.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="w-full sm:w-auto text-base gap-2 rounded-full h-14 px-8 shadow-sm" data-testid="button-start-editing">
                    Start Editing <ArrowRight size={18} />
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base rounded-full h-14 px-8" data-testid="button-view-docs">
                    View Components
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" data-testid="heading-features">Built for modern web apps</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">The perfect foundation packed with everything you need to build stunning interfaces.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: <Zap className="text-amber-500" size={24} />,
                  title: "Lightning Fast",
                  description: "Powered by Vite and React for an unparalleled development experience with instant hot module replacement."
                },
                {
                  icon: <Globe className="text-blue-500" size={24} />,
                  title: "Deploy Anywhere",
                  description: "Structure is fully optimized for static hosting platforms like Netlify. Just connect your repository and ship."
                },
                {
                  icon: <Code2 className="text-emerald-500" size={24} />,
                  title: "Modern Stack",
                  description: "Tailwind CSS, Framer Motion, and shadcn/ui components perfectly pre-configured and ready to use."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i} 
                  className="bg-background rounded-3xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  data-testid={`card-feature-${i}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-24 border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to paste it to Netlify?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tell me what features, pages, or components you'd like to add next. 
              I'll build them perfectly into this clean foundation.
            </p>
            <Button size="lg" className="rounded-full h-12 px-8" data-testid="button-cta">
              Let's customize this app
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Layers size={16} />
            AppBase
          </div>
          <p className="text-sm">© 2026 AppBase. Built for seamless deployment.</p>
          <div className="flex gap-4 text-sm font-medium">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}