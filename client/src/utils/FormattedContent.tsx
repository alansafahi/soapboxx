// Utility component for rendering content with markdown image support and HTML formatting
interface FormattedContentProps {
  content: string;
  className?: string;
  attachedMedia?: Array<{
    type: string;
    url: string;
    filename: string;
    size?: number;
  }>;
}

export default function FormattedContent({ content, className, attachedMedia }: FormattedContentProps) {
  console.log('FormattedContent received attachedMedia:', attachedMedia);
  console.log('FormattedContent attachedMedia type:', typeof attachedMedia);
  console.log('FormattedContent attachedMedia is array?', Array.isArray(attachedMedia));
  
  const formatContent = (htmlContent: string) => {
    return htmlContent
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**') // Bold
      .replace(/<b>(.*?)<\/b>/gi, '**$1**') // Bold
      .replace(/<em>(.*?)<\/em>/gi, '*$1*') // Italic
      .replace(/<i>(.*?)<\/i>/gi, '*$1*') // Italic
      .replace(/<u>(.*?)<\/u>/gi, '_$1_') // Underline
      .replace(/<br\s*\/?>/gi, '\n') // Line breaks
      .replace(/<p>(.*?)<\/p>/gi, '$1\n') // Paragraphs
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .trim();
  };
  
  const formattedContent = formatContent(content);
  
  // Parse markdown images and videos
  const parseMarkdown = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Match markdown images: ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = imageRegex.exec(text)) !== null) {
      // Add text before the image
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add the image
      parts.push({
        type: 'image',
        alt: match[1],
        src: match[2],
        index: parts.length
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length === 0 ? [text] : parts;
  };
  
  const parts = parseMarkdown(formattedContent);
  

  
  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (typeof part === 'object' && part.type === 'image') {
          return (
            <img 
              key={index}
              src={part.src} 
              alt={part.alt} 
              className="max-w-full h-auto rounded-lg my-3 border shadow-sm"
              style={{ maxHeight: '400px' }}
              loading="lazy"
            />
          );
        }
        
        // Handle text formatting for string parts
        const textPart = typeof part === 'string' ? part : '';
        return (
          <span key={index}>
            {textPart.split(/(\*\*.*?\*\*|\*.*?\*|_.*?_)/).map((textSegment, segIndex) => {
              if (textSegment.startsWith('**') && textSegment.endsWith('**')) {
                return <strong key={segIndex}>{textSegment.slice(2, -2)}</strong>;
              } else if (textSegment.startsWith('*') && textSegment.endsWith('*')) {
                return <em key={segIndex}>{textSegment.slice(1, -1)}</em>;
              } else if (textSegment.startsWith('_') && textSegment.endsWith('_')) {
                return <u key={segIndex}>{textSegment.slice(1, -1)}</u>;
              }
              return textSegment.split('\n').map((line, lineIndex, lines) => (
                lineIndex < lines.length - 1 ? (
                  <span key={lineIndex}>{line}<br /></span>
                ) : line
              ));
            })}
          </span>
        );
      })}
      
      {/* Display attached media */}
      {attachedMedia && attachedMedia.length > 0 && (
        <div className="mt-3 space-y-2">
          {attachedMedia.map((media, index) => {
            if (media.type === 'image') {
              return (
                <img 
                  key={index}
                  src={media.url} 
                  alt={media.filename || 'Attached image'} 
                  className="max-w-full h-auto rounded-lg border shadow-sm"
                  style={{ maxHeight: '400px' }}
                  loading="lazy"
                  onError={(e) => {
                    console.error('Image failed to load:', media.url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}