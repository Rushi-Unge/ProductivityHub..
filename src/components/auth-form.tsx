
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
import { Github, Chrome } from "lucide-react"; // Assuming Chrome for Google icon

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
    return null; // Or a loading spinner
  }

  return (
    <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-sm">
      <Tabs defaultValue="login" className="w-full">
        <CardHeader className="pb-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </CardHeader>
        <TabsContent value="login">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <CardContent className="space-y-4">
                <CardTitle className="text-2xl font-headline text-center">Welcome Back!</CardTitle>
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
                <Button type="submit" className="w-full">
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
              <CardContent className="space-y-4">
                <CardTitle className="text-2xl font-headline text-center">Create an Account</CardTitle>
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
                <Button type="submit" className="w-full">
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
