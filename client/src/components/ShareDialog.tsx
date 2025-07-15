import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Copy, Mail, MessageSquare, X } from "lucide-react";
import { FaFacebook, FaWhatsapp, FaInstagram, FaDiscord, FaSlack, FaYoutube, FaFacebookMessenger, FaSignal } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content: string;
  url?: string;
}

export default function ShareDialog({ isOpen, onClose, title = "Share Post", content, url }: ShareDialogProps) {
  const { toast } = useToast();
  
  const shareUrl = url || `${window.location.origin}/home`;
  const shareText = `Check out this post: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;

  const handleShare = async (platform: string) => {
    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          toast({
            title: "Link copied!",
            description: "The post link has been copied to your clipboard",
          });
          break;
          
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Opening Facebook",
            description: "Text copied to clipboard - paste into your Facebook post",
          });
          break;
          
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
          toast({
            title: "Opening X (Twitter)",
            description: "Share window opened in new tab",
          });
          break;
          
        case 'whatsapp':
          // Try WhatsApp app first, fallback to web
          const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
          const whatsappWebUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
          
          try {
            window.location.href = whatsappUrl;
            setTimeout(() => {
              window.open(whatsappWebUrl, '_blank');
            }, 1000);
          } catch (error) {
            window.open(whatsappWebUrl, '_blank');
          }
          
          toast({
            title: "Opening WhatsApp",
            description: "Opening WhatsApp app or web version",
          });
          break;
          
        case 'instagram':
          // Instagram doesn't have direct sharing URLs, so we'll try to open the app
          const instagramUrl = `instagram://camera`;
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          
          try {
            window.location.href = instagramUrl;
            toast({
              title: "Opening Instagram",
              description: "Content copied to clipboard - paste in Instagram story",
            });
          } catch (error) {
            // Fallback to web version
            window.open(`https://www.instagram.com/`, '_blank');
            toast({
              title: "Opening Instagram",
              description: "Content copied to clipboard - paste in Instagram",
            });
          }
          break;
          
        case 'discord':
          // Discord uses custom protocol for direct app opening
          const discordUrl = `discord://`;
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          
          try {
            window.location.href = discordUrl;
            toast({
              title: "Opening Discord",
              description: "Content copied to clipboard - paste in Discord",
            });
          } catch (error) {
            // Fallback to web version
            window.open(`https://discord.com/channels/@me`, '_blank');
            toast({
              title: "Opening Discord",
              description: "Content copied to clipboard - paste in Discord",
            });
          }
          break;
          
        case 'slack':
          // Slack deep link to open the app
          const slackUrl = `slack://open`;
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          
          try {
            window.location.href = slackUrl;
            toast({
              title: "Opening Slack",
              description: "Content copied to clipboard - paste in Slack",
            });
          } catch (error) {
            // Fallback to web version
            window.open(`https://slack.com/`, '_blank');
            toast({
              title: "Opening Slack",
              description: "Content copied to clipboard - paste in Slack",
            });
          }
          break;
          
        case 'signal':
          // Signal uses custom protocol
          const signalUrl = `sgnl://`;
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          
          try {
            window.location.href = signalUrl;
            toast({
              title: "Opening Signal",
              description: "Content copied to clipboard - paste in Signal",
            });
          } catch (error) {
            // Fallback message since Signal doesn't have web version
            toast({
              title: "Content copied!",
              description: "Paste into Signal app - link copied to clipboard",
            });
          }
          break;
          
        case 'youtube':
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          toast({
            title: "Content copied!",
            description: "Paste into YouTube comments - link copied to clipboard",
          });
          break;
          
        case 'messenger':
          window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=your_app_id`, '_blank');
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Opening Messenger",
            description: "Text copied to clipboard",
          });
          break;
          
        case 'sms':
          const smsBody = `${shareText}\n\n${shareUrl}`;
          window.open(`sms:?body=${encodeURIComponent(smsBody)}`, '_self');
          toast({
            title: "Opening SMS",
            description: "SMS composer opened",
          });
          break;
          
        case 'email':
          const emailSubject = "Inspiring Post from SoapBox Super App";
          const emailBody = `Hi,\n\nI wanted to share this inspiring post with you:\n\n"${shareText}"\n\nView the full post here: ${shareUrl}\n\nBlessings!`;
          window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_self');
          toast({
            title: "Opening Email",
            description: "Email composer opened",
          });
          break;
          
        default:
          break;
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Choose how you'd like to share this content</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-3 py-4">
          {/* Copy URL - Most used */}
          <Button
            variant="outline"
            onClick={() => handleShare('copy')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <Copy className="w-5 h-5" />
            <span className="text-xs">Copy URL</span>
          </Button>

          {/* Social Media Platforms */}
          <Button
            variant="outline"
            onClick={() => handleShare('facebook')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <FaFacebook className="w-5 h-5 text-blue-600" />
            <span className="text-xs">Facebook</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('twitter')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <X className="w-5 h-5 text-black dark:text-white" />
            <span className="text-xs">X (Twitter)</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('whatsapp')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <FaWhatsapp className="w-5 h-5 text-green-500" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('instagram')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <FaInstagram className="w-5 h-5 text-pink-500" />
            <span className="text-xs">Instagram</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('messenger')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <FaFacebookMessenger className="w-5 h-5 text-blue-500" />
            <span className="text-xs">Messenger</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('discord')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <FaDiscord className="w-5 h-5 text-indigo-500" />
            <span className="text-xs">Discord</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('slack')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <FaSlack className="w-5 h-5 text-purple-500" />
            <span className="text-xs">Slack</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('signal')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <FaSignal className="w-5 h-5 text-blue-500" />
            <span className="text-xs">Signal</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('youtube')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <FaYoutube className="w-5 h-5 text-red-500" />
            <span className="text-xs">YouTube</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('sms')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <MessageSquare className="w-5 h-5 text-green-600" />
            <span className="text-xs">SMS</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('email')}
            className="flex flex-col items-center justify-center h-16 space-y-1"
          >
            <Mail className="w-5 h-5 text-gray-600" />
            <span className="text-xs">Email</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}