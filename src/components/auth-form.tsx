
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");
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
    toast({ title: "Login Successful", description: `Welcome back, ${data.email}!` });
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
        <Card className="w-full max-w-md bg-slate-800/30 dark:bg-slate-900/40 backdrop-blur-lg shadow-2xl border-slate-700/50 animate-pulse">
            <CardContent className="p-6 md:p-8">
                <div className="flex mb-6 rounded-lg bg-slate-700/30 dark:bg-slate-800/40 p-1">
                    <div className="h-10 flex-1 bg-slate-600/50 dark:bg-slate-700/50 rounded-md m-1"></div>
                    <div className="h-10 flex-1 bg-slate-600/50 dark:bg-slate-700/50 rounded-md m-1"></div>
                </div>
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="space-y-1.5">
                            <div className="h-4 bg-slate-600/50 dark:bg-slate-700/50 rounded w-1/4"></div>
                            <div className="h-11 bg-slate-600/50 dark:bg-slate-700/50 rounded-md w-full"></div>
                        </div>
                    ))}
                     <div className="h-11 bg-primary/50 rounded-md w-full mt-6"></div>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-slate-800/30 dark:bg-slate-900/40 backdrop-blur-lg shadow-2xl border-slate-700/50">
      <CardContent className="p-6 md:p-8">
        <div className="flex mb-6 rounded-lg bg-slate-700/30 dark:bg-slate-800/40 p-1">
          <Button
            onClick={() => setActiveTab("login")}
            variant="ghost"
            className={cn(
              "flex-1 text-white hover:bg-primary/30",
              activeTab === "login" ? "bg-primary/70 hover:bg-primary" : "bg-transparent"
            )}
          >
            Login
          </Button>
          <Button
            onClick={() => setActiveTab("signup")}
            variant="ghost"
            className={cn(
              "flex-1 text-white hover:bg-primary/30",
              activeTab === "signup" ? "bg-primary/70 hover:bg-primary" : "bg-transparent"
            )}
          >
            Sign Up
          </Button>
        </div>

        {activeTab === "login" && (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-slate-300">Email</Label>
                    <div className="relative">
                       <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                       <Input placeholder="Enter your email" {...field} className="pl-10 bg-slate-700/40 dark:bg-slate-800/50 border-slate-600/70 dark:border-slate-700/80 text-white placeholder:text-slate-400 focus:bg-slate-700/60 dark:focus:bg-slate-800/70 focus:border-primary/70" />
                    </div>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-slate-300">Password</Label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} className="pl-10 pr-10 bg-slate-700/40 dark:bg-slate-800/50 border-slate-600/70 dark:border-slate-700/80 text-white placeholder:text-slate-400 focus:bg-slate-700/60 dark:focus:bg-slate-800/70 focus:border-primary/70" />
                        <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-gradient text-white font-semibold py-3 mt-2">
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
                    <Label className="text-slate-300">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input placeholder="Enter your full name" {...field} className="pl-10 bg-slate-700/40 dark:bg-slate-800/50 border-slate-600/70 dark:border-slate-700/80 text-white placeholder:text-slate-400 focus:bg-slate-700/60 dark:focus:bg-slate-800/70 focus:border-primary/70" />
                    </div>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-slate-300">Email</Label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input placeholder="Enter your email" {...field} className="pl-10 bg-slate-700/40 dark:bg-slate-800/50 border-slate-600/70 dark:border-slate-700/80 text-white placeholder:text-slate-400 focus:bg-slate-700/60 dark:focus:bg-slate-800/70 focus:border-primary/70" />
                    </div>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-slate-300">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input type={showPassword ? "text" : "password"} placeholder="Create a password" {...field} className="pl-10 pr-10 bg-slate-700/40 dark:bg-slate-800/50 border-slate-600/70 dark:border-slate-700/80 text-white placeholder:text-slate-400 focus:bg-slate-700/60 dark:focus:bg-slate-800/70 focus:border-primary/70" />
                        <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-slate-300">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" {...field} className="pl-10 pr-10 bg-slate-700/40 dark:bg-slate-800/50 border-slate-600/70 dark:border-slate-700/80 text-white placeholder:text-slate-400 focus:bg-slate-700/60 dark:focus:bg-slate-800/70 focus:border-primary/70" />
                        <button type="button" onClick={toggleConfirmPasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label className="text-slate-400 text-sm">
                        I agree to the <a href="#" className="text-primary hover:underline">Terms</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      </Label>
                      <FormMessage className="text-red-400" />
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-gradient text-white font-semibold py-3 mt-2">
                Create Account
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
