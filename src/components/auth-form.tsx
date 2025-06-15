
"use client"

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react"; 
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const AppLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110">
    <path d="M12 2C10.3431 2 9 3.34315 9 5V7H15V5C15 3.34315 13.6569 2 12 2Z" />
    <path d="M9 9V15C9 16.6569 10.3431 18 12 18C13.6569 18 15 16.6569 15 15V9H9Z" />
    <path d="M7 18C7 19.6569 8.34315 21 10 21H14C15.6569 21 17 19.6569 17 18V16H7V18Z" />
    <path d="M5 7C3.34315 7 2 8.34315 2 10V14C2 15.6569 3.34315 17 5 17H7V7H5Z" />
    <path d="M19 7H17V17H19C20.6569 17 22 15.6569 22 14V10C22 8.34315 20.6569 7 19 7Z" />
  </svg>
);

export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", terms: false },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    toast({ title: "Login Successful", description: `Welcome back!` });
    if (isClient) localStorage.setItem("prohub-auth-status", "loggedIn");
    router.push("/dashboard");
  };

  const onSignupSubmit = (data: SignupFormValues) => {
    toast({ title: "Signup Successful", description: "Your account has been created." });
    if (isClient) localStorage.setItem("prohub-auth-status", "loggedIn");
    router.push("/dashboard");
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  if (!isClient) {
    return (
        <Card className="w-full max-w-md bg-card/10 dark:bg-card/20 backdrop-blur-md shadow-xl border-border/30 animate-pulse rounded-2xl">
            <CardHeader className="flex flex-col items-center text-center p-6">
                <div className="h-8 w-8 bg-primary/30 rounded-md mb-2"></div>
                <div className="h-7 w-32 bg-foreground/30 rounded-md mb-4"></div>
                <div className="flex w-full rounded-lg bg-muted/20 p-1">
                    <div className="h-10 flex-1 bg-primary/20 rounded-md m-0.5"></div>
                    <div className="h-10 flex-1 bg-transparent rounded-md m-0.5"></div>
                </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0">
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="space-y-1.5">
                            <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
                            <div className="h-11 bg-card/30 dark:bg-card/50 rounded-md w-full"></div>
                        </div>
                    ))}
                     <div className="h-11 bg-primary/50 rounded-md w-full mt-6"></div>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-card/80 dark:bg-card/90 backdrop-blur-lg shadow-xl border-border/30 dark:border-border/50 rounded-2xl">
      <CardHeader className="flex flex-col items-center text-center p-6">
        <AppLogo />
        <h2 className="text-2xl font-semibold text-foreground mt-2 font-headline">ProHub</h2>
         <div className="flex w-full mt-4 rounded-lg bg-muted/50 dark:bg-muted/30 p-1">
          <Button
            onClick={() => setActiveTab("login")}
            variant="ghost"
            className={cn(
              "flex-1 text-foreground hover:bg-primary/10 rounded-md",
              activeTab === "login" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-transparent"
            )}
          >
            Login
          </Button>
          <Button
            onClick={() => setActiveTab("signup")}
            variant="ghost"
            className={cn(
              "flex-1 text-foreground hover:bg-primary/10 rounded-md",
              activeTab === "signup" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-transparent"
            )}
          >
            Sign Up
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8 pt-0">
        {activeTab === "login" && (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="relative">
                       <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
                       <Input placeholder="your.email@example.com" {...field} className="pl-10 bg-background/70 dark:bg-muted/40 border-border/70 dark:border-border/60 text-foreground placeholder:text-muted-foreground/80 focus:bg-background focus:dark:bg-muted/50 focus:border-primary/70 rounded-md" />
                    </div>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-muted-foreground">Password</Label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} className="pl-10 pr-10 bg-background/70 dark:bg-muted/40 border-border/70 dark:border-border/60 text-foreground placeholder:text-muted-foreground/80 focus:bg-background focus:dark:bg-muted/50 focus:border-primary/70 rounded-md" />
                        <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground/90">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-gradient text-primary-foreground font-semibold py-3 mt-2 text-base rounded-md">
                Login
              </Button>
            </form>
          </Form>
        )}

        {activeTab === "signup" && (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
               <FormField
                control={signupForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
                        <Input placeholder="Your Full Name" {...field} className="pl-10 bg-background/70 dark:bg-muted/40 border-border/70 dark:border-border/60 text-foreground placeholder:text-muted-foreground/80 focus:bg-background focus:dark:bg-muted/50 focus:border-primary/70 rounded-md" />
                    </div>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-muted-foreground">Email</Label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
                        <Input placeholder="your.email@example.com" {...field} className="pl-10 bg-background/70 dark:bg-muted/40 border-border/70 dark:border-border/60 text-foreground placeholder:text-muted-foreground/80 focus:bg-background focus:dark:bg-muted/50 focus:border-primary/70 rounded-md" />
                    </div>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-muted-foreground">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
                        <Input type={showPassword ? "text" : "password"} placeholder="Create a password" {...field} className="pl-10 pr-10 bg-background/70 dark:bg-muted/40 border-border/70 dark:border-border/60 text-foreground placeholder:text-muted-foreground/80 focus:bg-background focus:dark:bg-muted/50 focus:border-primary/70 rounded-md" />
                        <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground/90">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-muted-foreground">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" {...field} className="pl-10 pr-10 bg-background/70 dark:bg-muted/40 border-border/70 dark:border-border/60 text-foreground placeholder:text-muted-foreground/80 focus:bg-background focus:dark:bg-muted/50 focus:border-primary/70 rounded-md" />
                        <button type="button" onClick={toggleConfirmPasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground/90">
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground mt-0.5"
                        id="terms"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="terms" className="text-muted-foreground text-sm font-normal">
                        I agree to the <a href="#" className="text-primary hover:underline">Terms</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      </Label>
                      <FormMessage className="text-destructive" />
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-gradient text-primary-foreground font-semibold py-3 mt-2 text-base rounded-md">
                Create Account
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

