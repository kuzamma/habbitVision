import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { Loader2, Save } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);

  // Fetch user data from API
  const { data: userData, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users/current"],
  });

  // State to hold edited data during form editing
  const [editedUserData, setEditedUserData] = useState<Partial<User>>({});

  // Get stats data
  const { data: statsData } = useQuery({
    queryKey: ["/api/stats"],
  });

  // User stats from the stats data
  const userStats = {
    totalHabits: statsData?.activeHabits || 0,
    activeDays: statsData?.totalDays || 0,
    longestStreak: statsData?.longestStreak || 0,
    avgCompletionRate: statsData?.completionRate || 0,
  };

  // Update user profile mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return apiRequest("PUT", `/api/users/${userData?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      // Reset edited data and exit edit mode
      setEditedUserData({});
      setEditing(false);
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/users/current"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setEditedUserData({
      ...editedUserData,
      [field]: value
    });
  };

  const handleUpdateProfile = () => {
    if (Object.keys(editedUserData).length === 0) {
      toast({
        title: "No changes",
        description: "You haven't made any changes to your profile.",
      });
      setEditing(false);
      return;
    }
    updateUserMutation.mutate(editedUserData);
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Default values for user fields
  const fullName = userData?.fullName || '';
  const username = userData?.username || '';
  const email = userData?.email || '';
  const bio = userData?.bio || '';
  const userId = userData?.id;
  
  // Handle cancel button click
  const handleCancel = () => {
    setEditing(false);
    setEditedUserData({});
  };

  // Get initials for avatar
  const initials = fullName ? getInitials(fullName) : username ? username.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-gray-500">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile summary card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-xl font-semibold mb-1">
                  {fullName || username}
                </h2>
                <p className="text-gray-500 mb-4">@{username}</p>

                <div className="w-full bg-gray-100 h-px mb-4"></div>

                <div className="grid grid-cols-2 gap-4 w-full text-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {userStats.totalHabits}
                    </p>
                    <p className="text-sm text-gray-500">Habits</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userStats.longestStreak}
                    </p>
                    <p className="text-sm text-gray-500">Day Streak</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userStats.activeDays}</p>
                    <p className="text-sm text-gray-500">Active Days</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userStats.avgCompletionRate}%
                    </p>
                    <p className="text-sm text-gray-500">Completion</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Account Information</CardTitle>
                {!editing ? (
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal">
                <TabsList className="mb-4">
                  <TabsTrigger value="personal">
                    Personal Information
                  </TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={editing ? (editedUserData.fullName !== undefined ? editedUserData.fullName : fullName) : fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        disabled={true} // Username can't be changed
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editing ? (editedUserData.email !== undefined ? editedUserData.email : email) : email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={editing ? (editedUserData.bio !== undefined ? editedUserData.bio : bio) : bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!editing}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Theme Preferences</h3>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        className="flex-1 justify-start"
                      >
                        <span className="h-4 w-4 rounded-full bg-primary mr-2"></span>
                        Light Mode
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start"
                      >
                        <span className="h-4 w-4 rounded-full bg-gray-800 mr-2"></span>
                        Dark Mode
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start"
                      >
                        <span className="h-4 w-4 rounded-full bg-gradient-to-r from-gray-300 to-gray-800 mr-2"></span>
                        System Default
                      </Button>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-lg font-medium mb-2">
                        Notifications
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Configure how and when you receive notifications about
                        your habits.
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="emailNotifications">
                            Email Notifications
                          </Label>
                          <input
                            type="checkbox"
                            id="emailNotifications"
                            className="toggle"
                            disabled={!editing}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="pushNotifications">
                            Push Notifications
                          </Label>
                          <input
                            type="checkbox"
                            id="pushNotifications"
                            className="toggle"
                            disabled={!editing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
