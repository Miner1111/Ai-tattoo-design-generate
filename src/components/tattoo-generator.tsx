'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { generateTattooDesign, GenerateTattooDesignOutput } from '@/ai/flows/generate-tattoo-design';
import { useToast } from '@/hooks/use-toast';
import { CircularProgress } from './circular-progress';

const formSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long.'),
});

type TattooGeneratorProps = {
  onImageGenerated: (url: string | null) => void;
};

export function TattooGenerator({ onImageGenerated }: TattooGeneratorProps) {
  const [generation, setGeneration] = useState<GenerateTattooDesignOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    let timer: NodeJS.Timeout | undefined;
    setProgress(0);
    timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(timer);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 400);

    return () => {
      clearInterval(timer);
    };
  }, [isLoading]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    // AdMob Interstitial Ad load logic placeholder
    console.log("Interstitial ad would be loaded here.");

    setIsLoading(true);
    setGeneration(null);
    onImageGenerated(null);
    try {
      const result = await generateTattooDesign({ prompt: values.prompt });
      setProgress(100);
      
      setTimeout(() => {
        setGeneration(result);
        onImageGenerated(result.tattooDesign.url);
        setIsLoading(false);
      }, 500);

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error generating tattoo',
        description: 'There was a problem with the AI generator. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
      setProgress(0);
    }
  }

  const imageUrl = generation?.tattooDesign?.url;

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'tattoo-design.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <Card className="w-full bg-transparent border-2 border-primary box-glow">
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Describe your tattoo idea..."
                        className="bg-black border-2 border-primary h-14 text-base pl-4 pr-4 text-primary placeholder:text-primary/70 focus:ring-accent focus:ring-offset-0 focus:ring-offset-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-accent"/>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="w-full flex justify-center">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-auto px-8 py-3 rounded-full border-2 border-primary bg-transparent text-primary box-glow hover:bg-accent/20 text-lg font-semibold"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Generate'}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="w-full h-[500px] relative rounded-lg overflow-hidden box-glow border-2 border-dashed border-primary flex items-center justify-center bg-black/20">
        {isLoading ? (
            <CircularProgress value={progress} />
        ) : imageUrl ? (
          <Image src={imageUrl} alt="Generated tattoo design" layout="fill" objectFit="contain" />
        ) : (
            <div className="text-center text-primary/70">
                <p className="text-lg">Your generated tattoo will appear here.</p>
            </div>
        )}
      </div>

      <Button
        onClick={handleDownload}
        disabled={!imageUrl || isLoading}
        variant="outline"
        className={cn(
          "w-[150px] h-[150px] rounded-full border-4 border-primary bg-transparent text-primary box-glow hover:bg-accent/20 hover:text-accent-foreground hover:border-accent flex flex-col gap-2 p-4",
          imageUrl && !isLoading && "animate-pulse"
        )}
      >
        <Download className="w-12 h-12" />
        <span className="font-bold">Download</span>
      </Button>

      {/* AdMob Banner Ad Placeholder */}
      <div className="w-full h-[60px] bg-black/20 border-2 border-dashed border-primary flex items-center justify-center mt-4">
        <p className="text-primary/70">Banner Ad Placeholder</p>
      </div>
    </div>
  );
}
