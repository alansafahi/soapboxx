                        <FormField
                          control={createForm.control}
                          name="linkedinUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://linkedin.com/company/community" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>



                    {/* Service Times Section - Only for Churches */}
                    {selectedType === 'church' && (
                      <>
                        <div className="col-span-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                            Service Times
                          </h3>
                        </div>

                        <FormField
                          control={createForm.control}
                          name="officeHours"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>🕒 Office Hours (Auto-filled by denomination)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Mon-Fri 9AM-4PM"
                                  rows={2}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name="worshipTimes"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>⛪ Worship Times (Auto-filled by denomination)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Sunday: 9AM & 11AM"
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Dynamic Service Times Section */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-lg font-semibold">Additional Times</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {timeRows.map((row, index) => (
                          <div key={row.id} className="grid grid-cols-12 gap-3 items-end">
                            {/* Event/Time Label */}
                            <div className="col-span-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Event/Time Label
                              </label>
                              <Input
                                placeholder="e.g., Sunday Service, Youth Group"
                                value={row.eventLabel}
                                onChange={(e) => updateTimeRow(row.id, 'eventLabel', e.target.value)}
                              />
                            </div>
                            
                            {/* Time/Schedule */}
                            <div className="col-span-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Time/Schedule
                              </label>
                              <Input
                                placeholder="e.g., Sunday 10:00 AM"
                                value={row.timeSchedule}
                                onChange={(e) => updateTimeRow(row.id, 'timeSchedule', e.target.value)}
                              />
                            </div>
                            
                            {/* Language */}
                            <div className="col-span-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Language
                              </label>
                              <Select 
                                value={row.language} 
                                onValueChange={(value) => updateTimeRow(row.id, 'language', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {LANGUAGE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Remove Button */}
                            <div className="col-span-1">
                              {timeRows.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeTimeRow(row.id)}
                                  className="h-9 w-9 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Another Row Button */}
                        {timeRows.length < 6 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addTimeRow}
                            className="w-full mt-3"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Date/Time
                          </Button>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setCreateCommunityOpen(false);
                        createForm.reset();
                        setShowCustomDenomination(false);
                        setLogoFile(null);
                        setLogoPreview("");
                        setTimeRows([{ id: 1, eventLabel: '', timeSchedule: '', language: 'english' }]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCommunityMutation.isPending}>
                      {createCommunityMutation.isPending ? "Creating..." : "Create Community"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {userCommunities.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Building className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Communities Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                You haven't joined any communities yet. Discover and connect with faith communities in your area.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => {
                    // Scroll to the community discovery section
                    const discoverySection = document.querySelector('#community-discovery');
                    if (discoverySection) {
                      discoverySection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Join a Community
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Churches Section */}
          {userCommunities.filter(c => c.type === 'church').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Churches</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {userCommunities.filter(c => c.type === 'church').length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCommunities.filter(c => c.type === 'church').sort((a, b) => a.name.localeCompare(b.name)).map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {community.logoUrl ? (
                            <img 
                              src={community.logoUrl} 
                              alt={`${community.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-6 truncate">
                              {community.name}
                            </CardTitle>
                            <CardDescription>
                              {community.denomination}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(community.role)}>
                          {formatRole(community.role)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {community.city}, {community.state}
                          </span>
                        </div>
                        {community.memberCount && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{community.memberCount} members</span>
                          </div>
                        )}
                      </div>
                      
                      {community.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {community.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedCommunityId(community.id.toString());
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {(community.role === 'church_admin' || community.role === 'admin' || community.role === 'pastor' || community.role === 'lead-pastor' || community.role === 'elder') && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                window.location.href = `/community-administration?communityId=${community.id}`;
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteCommunity(community.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ministries Section */}
          {userCommunities.filter(c => c.type === 'ministry').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ministries</h3>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {userCommunities.filter(c => c.type === 'ministry').length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCommunities.filter(c => c.type === 'ministry').sort((a, b) => a.name.localeCompare(b.name)).map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow border-2 border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {community.logoUrl ? (
                            <img 
                              src={community.logoUrl} 
                              alt={`${community.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-6 truncate">
                              {community.name}
                            </CardTitle>
                            <CardDescription>
                              {community.denomination}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(community.role)}>
                          {formatRole(community.role)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {community.city}, {community.state}
                          </span>
                        </div>
                        {community.memberCount && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{community.memberCount} members</span>
                          </div>
                        )}
                      </div>
                      
                      {community.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {community.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedCommunityId(community.id.toString());
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {(community.role === 'church_admin' || community.role === 'admin' || community.role === 'pastor' || community.role === 'lead-pastor' || community.role === 'elder') && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                window.location.href = `/community-administration?communityId=${community.id}`;
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteCommunity(community.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Groups Section */}
          {userCommunities.filter(c => c.type === 'group').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Groups</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {userCommunities.filter(c => c.type === 'group').length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCommunities.filter(c => c.type === 'group').sort((a, b) => a.name.localeCompare(b.name)).map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow border-2 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {community.logoUrl ? (
                            <img 
                              src={community.logoUrl} 
                              alt={`${community.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-6 truncate">
                              {community.name}
                            </CardTitle>
                            <CardDescription>
                              {community.denomination}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(community.role)}>
                          {formatRole(community.role)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {community.city}, {community.state}
                          </span>
                        </div>
                        {community.memberCount && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{community.memberCount} members</span>
                          </div>
                        )}
                      </div>
                      
                      {community.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {community.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedCommunityId(community.id.toString());
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {(community.role === 'church_admin' || community.role === 'admin' || community.role === 'pastor' || community.role === 'lead-pastor' || community.role === 'elder') && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                window.location.href = `/community-administration?communityId=${community.id}`;
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteCommunity(community.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Community View Dialog */}
      {selectedCommunityId && (
        <CommunityViewDialog
          isOpen={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedCommunityId(null);
          }}
          communityId={selectedCommunityId}
          userRole={userCommunities.find(c => c.id.toString() === selectedCommunityId)?.role}
        />
      )}
    </div>
  );
}