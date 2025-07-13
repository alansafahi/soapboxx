import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Shield, Clock, Info } from "lucide-react";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";

interface ExpirationSettingsProps {
  contentType: 'discussion' | 'prayer' | 'soap';
  initialExpiresAt?: Date | null;
  allowsExpiration?: boolean;
  onSettingsChange: (settings: {
    expiresAt: Date | null;
    allowsExpiration: boolean;
  }) => void;
}

export default function ExpirationSettings({
  contentType,
  initialExpiresAt,
  allowsExpiration = false,
  onSettingsChange
}: ExpirationSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(allowsExpiration);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Pre-defined expiration options
  const expirationOptions = [
    { value: "7d", label: "7 days", description: "Good for short-term updates" },
    { value: "30d", label: "30 days", description: "Monthly content lifecycle" },
    { value: "90d", label: "3 months", description: "Seasonal content" },
    { value: "365d", label: "1 year", description: "Annual content cycle" },
    { value: "custom", label: "Custom date", description: "Set specific expiration" }
  ];

  // Content type specific recommendations
  const getRecommendations = () => {
    switch (contentType) {
      case 'prayer':
        return {
          title: "Prayer Request Privacy",
          description: "Protect sensitive prayer requests with automatic expiration",
          recommended: ["30d", "90d"],
          icon: <Shield className="h-4 w-4" />
        };
      case 'soap':
        return {
          title: "S.O.A.P. Journal Privacy",
          description: "Personal reflections can be set to expire for privacy",
          recommended: ["90d", "365d"],
          icon: <Shield className="h-4 w-4" />
        };
      case 'discussion':
        return {
          title: "Discussion Post Privacy",
          description: "Community posts with automatic cleanup after time",
          recommended: ["90d", "365d"],
          icon: <Shield className="h-4 w-4" />
        };
    }
  };

  const recommendations = getRecommendations();

  useEffect(() => {
    if (initialExpiresAt) {
      setIsEnabled(true);
      // Try to match initial date to a predefined option
      const now = new Date();
      const diffDays = Math.round((initialExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 7) setSelectedOption("7d");
      else if (diffDays === 30) setSelectedOption("30d");
      else if (diffDays === 90) setSelectedOption("90d");
      else if (diffDays === 365) setSelectedOption("365d");
      else {
        setSelectedOption("custom");
        setCustomDate(initialExpiresAt);
      }
    }
  }, [initialExpiresAt]);

  const handleEnableChange = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      setSelectedOption("");
      setCustomDate(undefined);
      onSettingsChange({ expiresAt: null, allowsExpiration: false });
    } else {
      onSettingsChange({ expiresAt: null, allowsExpiration: true });
    }
  };

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    
    if (value === "custom") {
      // Don't set expiration date until user picks custom date
      return;
    }

    const now = new Date();
    let expiresAt: Date;

    switch (value) {
      case "7d":
        expiresAt = addDays(now, 7);
        break;
      case "30d":
        expiresAt = addDays(now, 30);
        break;
      case "90d":
        expiresAt = addDays(now, 90);
        break;
      case "365d":
        expiresAt = addDays(now, 365);
        break;
      default:
        return;
    }

    onSettingsChange({ expiresAt, allowsExpiration: true });
  };

  const handleCustomDateChange = (date: Date | undefined) => {
    setCustomDate(date);
    setIsCalendarOpen(false);
    
    if (date) {
      onSettingsChange({ expiresAt: date, allowsExpiration: true });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {recommendations.icon}
          <CardTitle className="text-sm font-medium">{recommendations.title}</CardTitle>
        </div>
        <CardDescription className="text-xs">
          {recommendations.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-expiration"
            checked={isEnabled}
            onCheckedChange={handleEnableChange}
          />
          <Label htmlFor="enable-expiration" className="text-sm font-medium">
            Enable content expiration
          </Label>
        </div>

        {isEnabled && (
          <>
            {/* Expiration Options */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Choose expiration period
              </Label>
              <Select value={selectedOption} onValueChange={handleOptionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration time..." />
                </SelectTrigger>
                <SelectContent>
                  {expirationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.label}</span>
                        {recommendations.recommended.includes(option.value) && (
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Picker */}
            {selectedOption === "custom" && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Select custom expiration date
                </Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDate ? format(customDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customDate}
                      onSelect={handleCustomDateChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Current Settings Display */}
            {(selectedOption && selectedOption !== "custom") || customDate ? (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Content will expire:</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedOption === "custom" && customDate 
                    ? format(customDate, "EEEE, MMMM do, yyyy")
                    : selectedOption === "7d" ? format(addDays(new Date(), 7), "EEEE, MMMM do, yyyy")
                    : selectedOption === "30d" ? format(addDays(new Date(), 30), "EEEE, MMMM do, yyyy")
                    : selectedOption === "90d" ? format(addDays(new Date(), 90), "EEEE, MMMM do, yyyy")
                    : selectedOption === "365d" ? format(addDays(new Date(), 365), "EEEE, MMMM do, yyyy")
                    : "Not set"
                  }
                </p>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Privacy Protection</p>
                  <p>Content will be automatically hidden from public view after expiration. Church administrators can still access expired content for oversight purposes.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}