// D.I.V.I.N.E. Phase 3A: Cross-Campus Member Management Component
import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { 
  Users, UserCheck2, Calendar, MapPin, Phone, Mail, 
  Building2, Clock, Plus, Edit, Trash2, Search, 
  Filter, UserPlus, HeartHandshake, ArrowRightLeft,
  Archive, BarChart3, History, UserCog, Star,
  CheckCircle, AlertCircle, User
} from "lucide-react";

interface CrossCampusMemberManagementProps {
  churchId: number;
}

// Campus Member Analytics Component
function CampusAnalytics({ churchId }: { churchId: number }) {
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null);

  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ["/api/cross-campus-members/analytics", churchId, selectedCampus],
    queryFn: () => {
      const url = selectedCampus 
        ? `/api/cross-campus-members/analytics/${churchId}/campus/${selectedCampus}`
        : `/api/cross-campus-members/analytics/${churchId}/campus`;
      return apiRequest(url, "GET");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BarChart3 className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold">Campus Member Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.analytics?.map((campus: any) => (
          <Card key={campus.campusId} className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {campus.campusName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-gray-600">Total:</span>
                  <span className="font-semibold">{campus.totalMembers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-600">Active:</span>
                  <span className="font-semibold">{campus.activeMembers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-600">Primary:</span>
                  <span className="font-semibold">{campus.primaryMembers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserPlus className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-gray-600">Recent:</span>
                  <span className="font-semibold">{campus.recentJoins}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Active Rate</span>
                  <span className="font-semibold">
                    {campus.totalMembers > 0 
                      ? Math.round((campus.activeMembers / campus.totalMembers) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Member Transfer Component
function MemberTransfer({ churchId }: { churchId: number }) {
  const [transferDialog, setTransferDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const { toast } = useToast();

  const transferForm = useForm({
    defaultValues: {
      userId: "",
      fromCampusId: 0,
      toCampusId: 0,
      transferReason: "",
      notes: ""
    }
  });

  // Get campuses for transfer selection
  const { data: campuses = [] } = useQuery({
    queryKey: ["/api/churches", churchId, "campuses"],
    queryFn: () => apiRequest(`/api/churches/${churchId}/campuses`, "GET")
  });

  // Get members by campus
  const { data: membersByCampus = [] } = useQuery({
    queryKey: ["/api/cross-campus-members/members", churchId],
    queryFn: () => apiRequest(`/api/cross-campus-members/members/${churchId}/campus`, "GET")
  });

  // Transfer member mutation
  const transferMutation = useMutation({
    mutationFn: (transferData: any) => 
      apiRequest("/api/cross-campus-members/members/transfer", "POST", transferData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member transferred successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cross-campus-members/members"] });
      setTransferDialog(false);
      transferForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to transfer member",
        variant: "destructive"
      });
    }
  });

  const handleTransfer = (data: any) => {
    transferMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Member Transfers</h3>
        </div>
        
        <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Transfer Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Transfer Member Between Campuses</DialogTitle>
              <DialogDescription>
                Move a member from one campus to another within your church
              </DialogDescription>
            </DialogHeader>
            
            <Form {...transferForm}>
              <form onSubmit={transferForm.handleSubmit(handleTransfer)} className="space-y-4">
                <FormField
                  control={transferForm.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Member</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose member to transfer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {membersByCampus.members?.map((member: any) => (
                            <SelectItem key={member.userId} value={member.userId}>
                              {member.fullName} - {member.campusName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={transferForm.control}
                    name="fromCampusId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Campus</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Source campus" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {campuses.campuses?.map((campus: any) => (
                              <SelectItem key={campus.id} value={campus.id.toString()}>
                                {campus.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transferForm.control}
                    name="toCampusId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Campus</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Destination campus" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {campuses.campuses?.map((campus: any) => (
                              <SelectItem key={campus.id} value={campus.id.toString()}>
                                {campus.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={transferForm.control}
                  name="transferReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transfer Reason</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Why is this member being transferred?" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={transferForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Any additional information..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={transferMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {transferMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transferring...
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-4 h-4" />
                        Transfer Member
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members by Campus Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members by Campus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersByCampus.members?.map((member: any) => (
                  <TableRow key={`${member.userId}-${member.campusId}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">{member.fullName}</div>
                          <div className="text-sm text-gray-600">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        {member.campusName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={member.membershipStatus === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {member.membershipStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.isPrimaryCampus ? (
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Primary
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(member.assignedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            transferForm.setValue("userId", member.userId);
                            transferForm.setValue("fromCampusId", member.campusId);
                            setTransferDialog(true);
                          }}
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Transfer History Component
function TransferHistory({ churchId }: { churchId: number }) {
  const { data: transferHistory = [], isLoading } = useQuery({
    queryKey: ["/api/cross-campus-members/transfers", churchId],
    queryFn: () => apiRequest(`/api/cross-campus-members/transfers/${churchId}`, "GET")
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <History className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold">Transfer History</h3>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Transfer</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferHistory.history?.map((transfer: any) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <div className="font-medium">{transfer.userName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                          {transfer.fromCampusName || 'Unknown'}
                        </span>
                        <ArrowRightLeft className="w-3 h-3 text-gray-400" />
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {transfer.toCampusName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {transfer.transferReason || 'No reason specified'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(transfer.transferDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={transfer.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {transfer.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Cross-Campus Member Management Component
export function CrossCampusMemberManagement({ churchId }: CrossCampusMemberManagementProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Cross-Campus Member Management
        </h2>
        <p className="text-gray-600">
          D.I.V.I.N.E. Phase 3A: Manage members across multiple campuses
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Transfers
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <CampusAnalytics churchId={churchId} />
        </TabsContent>

        <TabsContent value="transfers">
          <MemberTransfer churchId={churchId} />
        </TabsContent>

        <TabsContent value="history">
          <TransferHistory churchId={churchId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}