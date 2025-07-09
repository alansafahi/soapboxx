interface FormattedContentProps {
  content: string;
  className?: string;
}

export function FormattedContent({ content, className = "" }: FormattedContentProps) {
  if (!content) return null;

  // Remove HTML tags and preserve line breaks
  const cleanContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Split by line breaks and render paragraphs
  const lines = cleanContent.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length <= 1) {
    return (
      <div className={`text-gray-700 dark:text-gray-200 ${className}`}>
        {cleanContent}
      </div>
    );
  }

  return (
    <div className={`text-gray-700 dark:text-gray-200 space-y-2 ${className}`}>
      {lines.map((line, index) => (
        <p key={index} className="leading-relaxed">
          {line}
        </p>
      ))}
    </div>
  );
}

export default FormattedContent;