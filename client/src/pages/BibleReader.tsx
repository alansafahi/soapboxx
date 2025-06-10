import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, Volume2, Settings, Search, Bookmark, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

// Sample Bible content for the sections from Bible in a Day
const BIBLE_CONTENT: Record<string, BibleChapter[]> = {
  creation: [
    {
      book: "Genesis",
      chapter: 1,
      verses: [
        { book: "Genesis", chapter: 1, verse: 1, text: "In the beginning God created the heavens and the earth." },
        { book: "Genesis", chapter: 1, verse: 2, text: "Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters." },
        { book: "Genesis", chapter: 1, verse: 3, text: "And God said, 'Let there be light,' and there was light." },
        { book: "Genesis", chapter: 1, verse: 4, text: "God saw that the light was good, and he separated the light from the darkness." },
        { book: "Genesis", chapter: 1, verse: 5, text: "God called the light 'day,' and the darkness he called 'night.' And there was evening, and there was morning—the first day." },
        { book: "Genesis", chapter: 1, verse: 26, text: "Then God said, 'Let us make mankind in our image, in our likeness, so that they may rule over the fish in the sea and the birds in the sky, over the livestock and all the wild animals, and over all the creatures that move along the ground.'" },
        { book: "Genesis", chapter: 1, verse: 27, text: "So God created mankind in his own image, in the image of God he created them; male and female he created them." },
        { book: "Genesis", chapter: 1, verse: 31, text: "God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day." }
      ]
    },
    {
      book: "Genesis",
      chapter: 2,
      verses: [
        { book: "Genesis", chapter: 2, verse: 7, text: "Then the Lord God formed a man from the dust of the ground and breathed into his nostrils the breath of life, and the man became a living being." },
        { book: "Genesis", chapter: 2, verse: 8, text: "Now the Lord God had planted a garden in the east, in Eden; and there he put the man he had formed." },
        { book: "Genesis", chapter: 2, verse: 15, text: "The Lord God took the man and put him in the Garden of Eden to work it and take care of it." },
        { book: "Genesis", chapter: 2, verse: 18, text: "The Lord God said, 'It is not good for the man to be alone. I will make a helper suitable for him.'" }
      ]
    }
  ],
  fall_promise: [
    {
      book: "Genesis",
      chapter: 12,
      verses: [
        { book: "Genesis", chapter: 12, verse: 1, text: "The Lord had said to Abram, 'Go from your country, your people and your father's household to the land I will show you.'" },
        { book: "Genesis", chapter: 12, verse: 2, text: "I will make you into a great nation, and I will bless you; I will make your name great, and you will be a blessing.'" },
        { book: "Genesis", chapter: 12, verse: 3, text: "I will bless those who bless you, and whoever curses you I will curse; and all peoples on earth will be blessed through you.'" }
      ]
    }
  ],
  kings_prophets: [
    {
      book: "1 Samuel",
      chapter: 16,
      verses: [
        { book: "1 Samuel", chapter: 16, verse: 7, text: "But the Lord said to Samuel, 'Do not consider his appearance or his height, for I have rejected him. The Lord does not look at the things people look at. People look at the outward appearance, but the Lord looks at the heart.'" }
      ]
    },
    {
      book: "Psalm",
      chapter: 23,
      verses: [
        { book: "Psalm", chapter: 23, verse: 1, text: "The Lord is my shepherd, I lack nothing." },
        { book: "Psalm", chapter: 23, verse: 2, text: "He makes me lie down in green pastures, he leads me beside quiet waters," },
        { book: "Psalm", chapter: 23, verse: 3, text: "he refreshes my soul. He guides me along the right paths for his name's sake." },
        { book: "Psalm", chapter: 23, verse: 4, text: "Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me." }
      ]
    }
  ],
  christ_messiah: [
    {
      book: "Luke",
      chapter: 2,
      verses: [
        { book: "Luke", chapter: 2, verse: 10, text: "But the angel said to them, 'Do not be afraid. I bring you good news that will cause great joy for all the people.'" },
        { book: "Luke", chapter: 2, verse: 11, text: "Today in the town of David a Savior has been born to you; he is the Messiah, the Lord.'" }
      ]
    },
    {
      book: "John",
      chapter: 1,
      verses: [
        { book: "John", chapter: 1, verse: 14, text: "The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth." }
      ]
    }
  ],
  church_born: [
    {
      book: "Acts",
      chapter: 2,
      verses: [
        { book: "Acts", chapter: 2, verse: 1, text: "When the day of Pentecost came, they were all together in one place." },
        { book: "Acts", chapter: 2, verse: 2, text: "Suddenly a sound like the blowing of a violent wind came from heaven and filled the whole house where they were sitting." },
        { book: "Acts", chapter: 2, verse: 3, text: "They saw what seemed to be tongues of fire that separated and came to rest on each of them." },
        { book: "Acts", chapter: 2, verse: 4, text: "All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them." }
      ]
    }
  ],
  future_hope: [
    {
      book: "Revelation",
      chapter: 21,
      verses: [
        { book: "Revelation", chapter: 21, verse: 1, text: "Then I saw 'a new heaven and a new earth,' for the first heaven and the first earth had passed away, and there was no longer any sea." },
        { book: "Revelation", chapter: 21, verse: 2, text: "I saw the Holy City, the new Jerusalem, coming down out of heaven from God, prepared as a bride beautifully dressed for her husband." },
        { book: "Revelation", chapter: 21, verse: 3, text: "And I heard a loud voice from the throne saying, 'Look! God's dwelling place is now among the people, and he will dwell with them. They will be his people, and God himself will be with them and be their God.'" },
        { book: "Revelation", chapter: 21, verse: 4, text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.'" }
      ]
    }
  ]
};

export default function BibleReader() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState('16');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [highlightedVerses, setHighlightedVerses] = useState<Set<string>>(new Set());
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const section = urlParams.get('section') || 'creation';
  const requestedVerses = urlParams.get('verses')?.split(',') || [];

  const chapters = BIBLE_CONTENT[section] || BIBLE_CONTENT.creation;
  const currentChapter = chapters[currentChapterIndex];

  useEffect(() => {
    // Auto-highlight requested verses
    if (requestedVerses.length > 0) {
      setHighlightedVerses(new Set(requestedVerses));
    }
  }, [requestedVerses]);

  const handleVerseHighlight = (verseRef: string) => {
    const newHighlighted = new Set(highlightedVerses);
    if (newHighlighted.has(verseRef)) {
      newHighlighted.delete(verseRef);
    } else {
      newHighlighted.add(verseRef);
    }
    setHighlightedVerses(newHighlighted);
  };

  const handleShare = async () => {
    const selectedVerses = Array.from(highlightedVerses);
    if (selectedVerses.length === 0) {
      toast({
        title: "No verses selected",
        description: "Please highlight some verses to share.",
        variant: "destructive",
      });
      return;
    }

    const shareText = `Check out these verses from ${currentChapter.book} ${currentChapter.chapter}: ${selectedVerses.join(', ')} - Shared from SoapBox Super App`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Verses copied and ready to share!",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not copy verses to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentChapter.book} {currentChapter.chapter}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                SoapBox Bible Reader
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14">14px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="18">18px</SelectItem>
                <SelectItem value="20">20px</SelectItem>
                <SelectItem value="24">24px</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chapter Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chapters</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  {chapters.map((chapter, index) => (
                    <Button
                      key={index}
                      variant={currentChapterIndex === index ? "default" : "ghost"}
                      className="w-full justify-start mb-2"
                      onClick={() => setCurrentChapterIndex(index)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {chapter.book} {chapter.chapter}
                    </Button>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bible Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {currentChapter.book} Chapter {currentChapter.chapter}
                  </CardTitle>
                  <Badge variant="secondary">
                    {currentChapter.verses.length} verses
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {currentChapter.verses.map((verse) => {
                      const verseRef = `${verse.book} ${verse.chapter}:${verse.verse}`;
                      const isHighlighted = highlightedVerses.has(verseRef);
                      
                      return (
                        <motion.div
                          key={`${verse.chapter}-${verse.verse}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: verse.verse * 0.1 }}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            isHighlighted
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => handleVerseHighlight(verseRef)}
                        >
                          <div className="flex items-start space-x-3">
                            <Badge variant="outline" className="mt-1 flex-shrink-0">
                              {verse.verse}
                            </Badge>
                            <p 
                              className="text-gray-800 dark:text-gray-200 leading-relaxed select-text"
                              style={{ fontSize: `${fontSize}px` }}
                            >
                              {verse.text}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {highlightedVerses.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                      Highlighted Verses ({highlightedVerses.size})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(highlightedVerses).map((verseRef) => (
                        <Badge key={verseRef} variant="secondary">
                          {verseRef}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Chapter Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mt-6"
        >
          <Button
            variant="outline"
            disabled={currentChapterIndex === 0}
            onClick={() => setCurrentChapterIndex(currentChapterIndex - 1)}
          >
            Previous Chapter
          </Button>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Chapter {currentChapterIndex + 1} of {chapters.length}
          </div>
          
          <Button
            variant="outline"
            disabled={currentChapterIndex === chapters.length - 1}
            onClick={() => setCurrentChapterIndex(currentChapterIndex + 1)}
          >
            Next Chapter
          </Button>
        </motion.div>
      </div>
    </div>
  );
}