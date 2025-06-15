
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Github, Chrome, LogIn, UserPlus } from "lucide-react"; 

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    // Simulate API call
    toast({ title: "Login Successful", description: `Welcome back, ${data.email}!` });
    if (isClient) {
      localStorage.setItem("prohub-auth-status", "loggedIn");
    }
    router.push("/dashboard");
  };

  const onSignupSubmit = (data: SignupFormValues) => {
    // Simulate API call
    toast({ title: "Signup Successful", description: "Your account has been created." });
    if (isClient) {
      localStorage.setItem("prohub-auth-status", "loggedIn");
    }
    router.push("/dashboard");
  };

  if (!isClient) {
    return (
        <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-md border-none animate-pulse">
            <CardHeader className="pb-2">
                 <div className="h-10 bg-muted rounded-md w-full"></div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                <div className="space-y-2 pt-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <div className="h-10 bg-muted rounded w-full"></div>
                 <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="h-10 bg-muted rounded w-full"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                </div>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-md border-none">
      <Tabs defaultValue="login" className="w-full">
        <CardHeader className="pb-2">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 dark:bg-muted/20">
            <TabsTrigger value="login" className="data-[state=active]:bg-card data-[state=active]:shadow-md">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-card data-[state=active]:shadow-md">Sign Up</TabsTrigger>
          </TabsList>
        </CardHeader>
        <TabsContent value="login">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <CardContent className="space-y-4 pt-4">
                <CardTitle className="text-2xl font-headline text-center flex items-center justify-center gap-2">
                  <LogIn className="h-7 w-7 text-primary" /> Welcome Back!
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access your ProHub dashboard.
                </CardDescription>
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full shadow-md hover:shadow-lg transition-shadow">
                  Login
                </Button>
                <p className="text-center text-sm text-muted-foreground">Or continue with</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    <Chrome className="mr-2 h-4 w-4" /> Google
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" /> GitHub
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="signup">
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
              <CardContent className="space-y-4 pt-4">
                <CardTitle className="text-2xl font-headline text-center flex items-center justify-center gap-2">
                  <UserPlus className="h-7 w-7 text-primary" /> Create an Account
                </CardTitle>
                <CardDescription className="text-center">
                  Join ProHub and boost your productivity today!
                </CardDescription>
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full shadow-md hover:shadow-lg transition-shadow">
                  Sign Up
                </Button>
                <p className="text-center text-sm text-muted-foreground">Or sign up with</p>
                 <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    <Chrome className="mr-2 h-4 w-4" /> Google
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" /> GitHub
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
