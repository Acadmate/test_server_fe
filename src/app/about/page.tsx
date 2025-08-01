"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { User, Phone, Mail, GraduationCap, BookOpen, Users, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { fetchUserInfo, clearUserInfoCache } from '@/actions/infoFerch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface UserInfo {
  registrationNumber: string
  name: string
  batch: number
  mobile: number
  program: string
  department: string
  semester: number
}

export interface Advisor {
  name: string
  role: string
  email: string
  phone: string
}

export interface InfoResponse {
  user: UserInfo
  advisors: Advisor[]
}

// Skeleton component for loading state
const PageSkeleton = () => (
  <div className="p-4 sm:p-6 lg:p-8 space-y-8">
    <div className="flex justify-between items-center">
      <Skeleton className="h-9 w-48" />
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

export default function UserInfoPage() {
  const [userInfo, setUserInfo] = useState<InfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserInfo = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserInfo({ forceRefresh });
      if (!data || !data.user) {
        throw new Error("Failed to fetch user information or data is incomplete.");
      }
      setUserInfo(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearCache = async () => {
    await clearUserInfoCache();
    await loadUserInfo(true);
  };

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-destructive-foreground mb-2">Something Went Wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => loadUserInfo(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <h2 className="text-2xl font-semibold text-foreground">No user information available.</h2>
            <p className="text-muted-foreground mt-2">Please try refreshing the data.</p>
        </div>
    );
  }

  const { user, advisors } = userInfo;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => loadUserInfo(true)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="destructive" onClick={handleClearCache}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                  <p className="text-muted-foreground">{user.registrationNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InfoItem icon={GraduationCap} label="Program" value={user.program} />
                  <InfoItem icon={BookOpen} label="Department" value={user.department} />
                  <InfoItem icon={Phone} label="Mobile" value={user.mobile} />
                </div>

                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <p className="text-sm text-primary font-medium">Batch</p>
                    <p className="text-2xl font-bold text-foreground">{user.batch}</p>
                  </div>
                  <div className="bg-green-400/5 border border-green-400/20 p-4 rounded-lg">
                    <p className="text-sm text-green-400 font-medium">Semester</p>
                    <p className="text-2xl font-bold text-foreground">{user.semester}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advisors Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-400/10 p-2 rounded-full">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Advisors</h3>
              </div>

              <div className="space-y-4">
                {advisors?.map((advisor, index) => (
                  <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                    <h4 className="font-semibold text-foreground">{advisor.name}</h4>
                    <p className="text-sm text-green-500 font-medium mb-2">{advisor.role}</p>
                    <div className="space-y-1">
                      <AdvisorContact icon={Mail} href={`mailto:${advisor.email}`} value={advisor.email} />
                      <AdvisorContact icon={Phone} href={`tel:${advisor.phone}`} value={advisor.phone} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components for consistent styling
const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
  <div className="flex items-center space-x-3">
    <Icon className="w-5 h-5 text-muted-foreground" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

const AdvisorContact = ({ icon: Icon, href, value }: { icon: React.ElementType, href: string, value: string }) => (
  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
    <Icon className="w-4 h-4" />
    <a href={href} className="hover:text-primary transition-colors">
      {value}
    </a>
  </div>
);