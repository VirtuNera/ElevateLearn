import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, University, Briefcase, Check, X } from "lucide-react";
import { DemoLogin } from "@/components/demo-login";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const [showDemoLogin, setShowDemoLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-palette">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="text-white text-2xl" />
              <h1 className="text-white text-xl font-semibold">Elevate 360 LMS</h1>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="text-white/90 hover:text-white transition-colors">Features</a>
              <a href="#courses" className="text-white/90 hover:text-white transition-colors">Courses</a>
              <a href="#about" className="text-white/90 hover:text-white transition-colors">About</a>
              <Button 
                variant="outline" 
                className="text-white border-white/30 hover:bg-white/10"
                onClick={() => setLocation("/")}
              >
                Access Dashboard
              </Button>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => setShowDemoLogin(true)}
              >
                Demo Login
              </Button>
              <Button
                className="bg-white text-primary hover:bg-gray-100 font-medium"
                onClick={() => setShowSignup(true)}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Learn Without Limits
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            A unified platform for Higher Education and Corporate Training. 
            Empower learners, streamline instruction, and scale knowledge across your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-semibold text-lg"
              onClick={() => setShowSignup(true)}
            >
              Start Learning Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white hover:bg-white/10 font-semibold text-lg text-[#2e5b7f]"
            >
              Browse Public Courses
            </Button>
          </div>
        </div>

        {/* Feature Cards Preview */}
        <div className="grid md:grid-cols-2 gap-8 mt-20">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="bg-academic p-3 rounded-lg mr-4">
                  <University className="text-white text-xl" />
                </div>
                <h3 className="text-white text-xl font-semibold">Higher Education</h3>
              </div>
              <p className="text-white/80 mb-4">
                Complete academic course management with assignments, gradebooks, rubrics, and collaborative learning tools.
              </p>
              <ul className="text-white/70 space-y-2">
                <li className="flex items-center"><Check className="mr-2 h-4 w-4" />Structured course modules</li>
                <li className="flex items-center"><Check className="mr-2 h-4 w-4" />Assignment management</li>
                <li className="flex items-center"><Check className="mr-2 h-4 w-4" />Peer collaboration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="bg-corporate p-3 rounded-lg mr-4">
                  <Briefcase className="text-white text-xl" />
                </div>
                <h3 className="text-white text-xl font-semibold">Corporate Training</h3>
              </div>
              <p className="text-white/80 mb-4">
                Self-paced microlearning with scenario-based assessments and automatic certification generation.
              </p>
              <ul className="text-white/70 space-y-2">
                <li className="flex items-center"><Check className="mr-2 h-4 w-4" />Microlearning modules</li>
                <li className="flex items-center"><Check className="mr-2 h-4 w-4" />Scenario simulations</li>
                <li className="flex items-center"><Check className="mr-2 h-4 w-4" />Auto-certifications</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Welcome Back</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowDemoLogin(true); setShowLogin(false); }}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" />
            </div>
            <Button type="submit" className="w-full">
              Try Demo Instead
            </Button>
          </form>
          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <button 
              onClick={() => { setShowLogin(false); setShowSignup(true); }}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </DialogContent>
      </Dialog>

      {/* Signup Modal */}
      <Dialog open={showSignup} onOpenChange={setShowSignup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Create Account</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowDemoLogin(true); setShowSignup(false); }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learner">Learner</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="orgType">Organization Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="higher-education">Higher Education</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a strong password" />
            </div>
            <Button type="submit" className="w-full">
              Try Demo Instead
            </Button>
          </form>
          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <button 
              onClick={() => { setShowSignup(false); setShowLogin(true); }}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </DialogContent>
      </Dialog>

      {/* Demo Login Modal */}
      <DemoLogin 
        isOpen={showDemoLogin} 
        onClose={() => setShowDemoLogin(false)} 
      />
    </div>
  );
}
