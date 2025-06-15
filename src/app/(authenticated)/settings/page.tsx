
"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, User, Lock, Bell } from "lucide-react";
import * as React from "react"; // Ensure React is imported for useState

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  avatarUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required.").min(6, "Password must be at least 6 characters."),
  newPassword: z.string().min(1, "New password is required.").min(6, "Password must be at least 6 characters."),
  confirmNewPassword: z.string().min(1, "Confirm password is required."),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match.",
  path: ["confirmNewPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

// Mock user data - in a real app, this would come from context or props
const initialUserData = {
  name: "Current User",
  email: "user@example.com",
  avatarUrl: "https://placehold.co/200x200.png",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [userData, setUserData] = React.useState(initialUserData);
  const [avatarPreview, setAvatarPreview] = React.useState(userData.avatarUrl);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userData.name,
      email: userData.email,
      avatarUrl: userData.avatarUrl,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });
  
  React.useEffect(() => {
    profileForm.reset({
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl
    });
    setAvatarPreview(userData.avatarUrl);
  }, [userData, profileForm]);

  const onProfileSubmit = (data: ProfileFormValues) => {
    // Simulate updating user data
    setUserData(prev => ({...prev, name: data.name, email: data.email, avatarUrl: data.avatarUrl || prev.avatarUrl }));
    // In a real app, you'd also update the avatar in the header if it's shown there.
    // For now, we just update the preview on this page.
    if (data.avatarUrl) {
      setAvatarPreview(data.avatarUrl);
    }
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    console.log("Profile data:", data);
    // Here you would typically make an API call to save the data
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    toast({ title: "Password Changed", description: "Your password has been successfully updated. (Simulated)" });
    console.log("Password data:", data);
    passwordForm.reset();
    // API call to change password
  };
  
  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    profileForm.setValue("avatarUrl", url); // Update form value
    if (profileSchema.shape.avatarUrl.safeParse(url).success) {
        setAvatarPreview(url); // Update preview if URL is valid
    } else if (!url) {
        setAvatarPreview(userData.avatarUrl); // Reset to original if input is cleared
    }
  };


  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 bg-muted/50 dark:bg-muted/20 rounded-xl p-1">
          <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md rounded-lg"><User className="h-4 w-4"/>Profile</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md rounded-lg"><Lock className="h-4 w-4"/>Security</TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md rounded-lg"><Bell className="h-4 w-4"/>Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and avatar.</CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <Avatar className="h-24 w-24 border-2 border-primary/50 shadow-md">
                      <AvatarImage src={avatarPreview} alt="User Avatar" data-ai-hint="user avatar professional" />
                      <AvatarFallback>{userData.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <FormField
                        control={profileForm.control}
                        name="avatarUrl"
                        render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormLabel>Avatar URL</FormLabel>
                            <FormControl>
                            <Input 
                                placeholder="https://example.com/avatar.png" 
                                {...field} 
                                onChange={handleAvatarUrlChange}
                                className="rounded-xl" 
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} className="rounded-xl"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="shadow-md hover:shadow-lg transition-shadow rounded-xl">Save Changes</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and account security.</CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="rounded-xl"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="rounded-xl"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="rounded-xl"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 rounded-xl border p-4 bg-muted/20">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold">Two-Factor Authentication (2FA)</Label>
                      <CardDescription>
                        Add an extra layer of security to your account. (UI Only)
                      </CardDescription>
                    </div>
                    <Switch id="2fa-switch" aria-label="Toggle Two-Factor Authentication"/>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="shadow-md hover:shadow-lg transition-shadow rounded-xl">Update Password</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 rounded-xl border p-4 bg-muted/20">
                <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Email Notifications</Label>
                    <CardDescription>Receive updates and alerts via email.</CardDescription>
                </div>
                <Switch id="email-notifications" defaultChecked aria-label="Toggle email notifications" />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 rounded-xl border p-4 bg-muted/20">
                 <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Desktop Push Notifications</Label>
                    <CardDescription>Get notified directly on your desktop.</CardDescription>
                 </div>
                <Switch id="desktop-notifications" aria-label="Toggle desktop push notifications" />
              </div>
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 rounded-xl border p-4 bg-muted/20">
                 <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Task Reminders</Label>
                    <CardDescription>Get reminders for upcoming task deadlines.</CardDescription>
                 </div>
                <Switch id="task-reminders" defaultChecked aria-label="Toggle task reminders" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={() => toast({title: "Preferences Saved", description: "Your notification preferences have been updated. (Simulated)"})} className="shadow-md hover:shadow-lg transition-shadow rounded-xl">Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    