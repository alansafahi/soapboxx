import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Plus, Building2, Users, Globe, Phone, MapPin, Clock } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Community name must be at least 2 characters." }),
  type: z.string().min(1, { message: "Please select a community type." }),
  denomination: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Invalid URL." }).optional().or(z.literal('')),
  privacySetting: z.string().default('public'),
  customDenomination: z.string().optional(),
});

type CommunityFormValues = z.infer<typeof formSchema>;

// Constants for dropdown options
const DENOMINATION_OPTIONS = [
  'Baptist', 'Methodist', 'Presbyterian', 'Lutheran', 'Episcopal', 'Catholic', 
  'Pentecostal', 'Assembly of God', 'Non-denominational', 'Other'
];

const MINISTRY_TYPE_OPTIONS = [
  'Youth Ministry', 'Children Ministry', 'Music Ministry', 'Worship Ministry',
  'Outreach Ministry', 'Discipleship Ministry', 'Prayer Ministry', 'Other'
];

const GROUP_TYPE_OPTIONS = [
  'Bible Study', 'Prayer Group', 'Fellowship Group', 'Support Group',
  'Small Group', 'Life Group', 'Connect Group', 'Other'
];

interface CommunityFormProps {
  mode: 'create' | 'edit';
  community?: any;
  onSubmit: (data: CommunityFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export function CommunityForm({ 
  mode, 
  community, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  submitButtonText = "Save Community" 
}: CommunityFormProps) {
  
  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: community?.name || "",
      type: community?.type || "",
      denomination: community?.denomination || "",
      description: community?.description || "",
      address: community?.address || "",
      city: community?.city || "",
      state: community?.state || "",
      zipCode: community?.zipCode || "",
      phone: community?.phone || "",
      email: community?.email || "",
      website: community?.website || "",
      privacySetting: community?.privacySetting || "public",
      customDenomination: community?.customDenomination || "",
    },
  });

  const watchedType = form.watch("type");
  const watchedDenomination = form.watch("denomination");

  const getDenominationOptions = () => {
    switch (watchedType) {
      case 'church':
        return DENOMINATION_OPTIONS;
      case 'ministry':
        return MINISTRY_TYPE_OPTIONS;
      case 'group':
        return GROUP_TYPE_OPTIONS;
      default:
        return [];
    }
  };

  const handleSubmit = (values: CommunityFormValues) => {
    onSubmit(values);
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 text-black dark:text-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 bg-white dark:bg-gray-800 text-black dark:text-white p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="First Baptist Church" 
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-gray-700 text-black dark:text-white">
                            <SelectValue placeholder="Select community type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                          <SelectItem value="church">Church</SelectItem>
                          <SelectItem value="ministry">Ministry</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedType && (
                  <FormField
                    control={form.control}
                    name="denomination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchedType === 'church' ? 'Denomination *' : 
                           watchedType === 'ministry' ? 'Ministry Type *' : 'Group Type *'}
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-gray-700 text-black dark:text-white">
                              <SelectValue placeholder={
                                watchedType === 'church' ? "Select denomination" :
                                watchedType === 'group' ? "Select group type" : "Select ministry type"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                            {getDenominationOptions().map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {watchedDenomination === 'Other' && (
                  <FormField
                    control={form.control}
                    name="customDenomination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom {watchedType === 'church' ? 'Denomination' : watchedType === 'group' ? 'Group Type' : 'Ministry Type'}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={`Enter custom ${watchedType === 'church' ? 'denomination' : watchedType === 'group' ? 'group type' : 'ministry type'}...`}
                            {...field}
                            className="bg-white dark:bg-gray-700 text-black dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="privacySetting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Privacy Setting *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-gray-700 text-black dark:text-white">
                            <SelectValue placeholder="Select privacy level..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                          <SelectItem value="public">🌍 Public - Visible to everyone</SelectItem>
                          <SelectItem value="private">🔒 Private - Invite only</SelectItem>
                          <SelectItem value="church_members_only">⛪ Church Members Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Optional Information */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your community..."
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="contact@community.org"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(555) 123-4567"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://www.community.org"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : submitButtonText}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}