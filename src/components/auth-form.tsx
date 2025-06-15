
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

  const handleGoogleLogin = () => {
    // Simulate Google login
    toast({ title: "Login Successful", description: "Welcome via Google!" });
    if (isClient) {
      localStorage.setItem("prohub-auth-status", "loggedIn");
    }
    router.push("/dashboard");
  };

  if (!isClient) {
    return (
        <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-md border-none animate-pulse">
            <CardHeader className="pb-4 pt-6 space-y-2 text-center">
                <div className="h-8 w-8 bg-muted rounded-full mx-auto"></div>
                <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
            </CardHeader>
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
      <CardHeader className="pb-4 pt-6 space-y-2 text-center">
        {/* App Logo */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-primary transition-transform duration-300 group-hover:scale-110 mx-auto">
            <path d="M12 2C10.3431 2 9 3.34315 9 5V7H15V5C15 3.34315 13.6569 2 12 2Z" />
            <path d="M9 9V15C9 16.6569 10.3431 18 12 18C13.6569 18 15 16.6569 15 15V9H9Z" />
            <path d="M7 18C7 19.6569 8.34315 21 10 21H14C15.6569 21 17 19.6569 17 18V16H7V18Z" />
            <path d="M5 7C3.34315 7 2 8.34315 2 10V14C2 15.6569 3.34315 17 5 17H7V7H5Z" />
            <path d="M19 7H17V17H19C20.6569 17 22 15.6569 22 14V10C22 8.34315 20.6569 7 19 7Z" />
        </svg>
        <h1 className="text-3xl font-headline font-semibold text-primary">
            ProHub
        </h1>
      </CardHeader>
      <Tabs defaultValue="login" className="w-full">
        <CardHeader className="pb-2 pt-0">
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
                  <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
                    <Chrome className="mr-2 h-4 w-4" /> Google
                  </Button>
                  <Button variant="outline" className="w-full" type="button">
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
                  <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
                    <Chrome className="mr-2 h-4 w-4" /> Google
                  </Button>
                  <Button variant="outline" className="w-full" type="button">
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

