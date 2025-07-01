'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TattooGenerator } from '@/components/tattoo-generator';
import { Share2, Bookmark, Star, GalleryVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedBookmarks = localStorage.getItem('tattooBookmarks');
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
  }, []);

  const toggleBookmark = () => {
    if (!currentImageUrl) return;

    const newBookmarks = bookmarks.includes(currentImageUrl)
      ? bookmarks.filter((b) => b !== currentImageUrl)
      : [...bookmarks, currentImageUrl];
    
    setBookmarks(newBookmarks);
    localStorage.setItem('tattooBookmarks', JSON.stringify(newBookmarks));
  };

  const handleShare = async () => {
    if (!currentImageUrl) return;

    if (!navigator.share) {
      toast({
        title: 'Sharing not supported',
        description: 'Your browser does not support the Web Share API.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(currentImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'tattoo-design.png', { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'AI Tattoo Design Generator',
          text: 'Check out this tattoo design I created with AI Tattoo Design Generator!',
        });
      } else {
        toast({
          title: 'Cannot share image',
          description: 'Your browser does not support sharing files.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Sharing failed',
        description: 'An error occurred while trying to share the image.',
        variant: 'destructive',
      });
    }
  };
  
  const handleReview = () => {
    // NOTE: You need to replace 'com.example.app' with your actual app package name from the Google Play Store.
    const packageName = 'com.example.app';
    try {
      // Try to open the Play Store app directly
      window.open(`market://details?id=${packageName}`, '_blank');
    } catch (e) {
      // Fallback to the Play Store website
      window.open(`https://play.google.com/store/apps/details?id=${packageName}`, '_blank');
    }
  };

  const isBookmarked = currentImageUrl && bookmarks.includes(currentImageUrl);

  return (
    <div className="flex flex-col min-h-screen bg-background text-primary font-body">
      <header className="py-6 text-center">
        <h1 className="text-5xl font-bold text-glow font-headline">Ai tattoo design generator</h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <TattooGenerator onImageGenerated={setCurrentImageUrl} />
      </main>

      <footer className="w-full py-8">
        <div className="container mx-auto flex justify-center items-center space-x-8">
          <Button variant="outline" size="icon" className="w-16 h-16 rounded-full border-2 border-primary box-glow hover:bg-accent/20 animate-pulse" onClick={handleShare} disabled={!currentImageUrl}>
            <Share2 className="w-8 h-8" />
            <span className="sr-only">Share</span>
          </Button>
          
          <Button variant="outline" size="icon" className="w-16 h-16 rounded-full border-2 border-primary box-glow hover:bg-accent/20 animate-pulse" onClick={toggleBookmark} disabled={!currentImageUrl}>
            <Bookmark className={cn("w-8 h-8", isBookmarked && "fill-primary")} />
            <span className="sr-only">Bookmark</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="w-16 h-16 rounded-full border-2 border-primary box-glow hover:bg-accent/20 animate-pulse">
                <GalleryVertical className="w-8 h-8" />
                <span className="sr-only">View Bookmarks</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-background text-primary border-primary">
              <SheetHeader>
                <SheetTitle className="text-glow text-2xl">Bookmarked Designs</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)]">
                {bookmarks.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 py-4 pr-4">
                    {bookmarks.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden box-glow border-2 border-primary">
                        <Image src={url} alt={`Bookmarked tattoo ${index + 1}`} layout="fill" objectFit="contain" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">You have no bookmarked tattoos yet.</p>
                  </div>
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="icon" className="w-16 h-16 rounded-full border-2 border-primary box-glow hover:bg-accent/20 animate-pulse" onClick={handleReview}>
            <Star className="w-8 h-8" />
            <span className="sr-only">Review</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
