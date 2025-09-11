"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { User, Phone, Mail, GraduationCap, BookOpen, Users, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchUserInfo } from '@/actions/infoFerch';
import { Button } from '@/components/ui/button';
import RefreshHeader from '@/components/shared/RefreshHeader';
import { AnimatedCopyButton } from '@/components/ui/AnimatedCopyButton';
import { formatLastFetchedText, setLastFetchedTime } from '@/lib/utils';
import { UserInfoData as InfoResponse } from "@/types";

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
      setLastFetchedTime("info");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

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
      <RefreshHeader
        onRefresh={() => loadUserInfo(true)}
        loading={loading}
        zIndex={30}
        className='w-[95vw] lg:w-[72vw] mx-auto'
        additionalInfo={formatLastFetchedText("info")}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{user?.name || 'N/A'}</h2>
                  <p className="text-muted-foreground">{user?.registrationNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InfoItem icon={GraduationCap} label="Program " value={user?.program || 'N/A'} />
                  <InfoItem icon={BookOpen} label="Department" value={user?.department || 'N/A'} />
                  <InfoItem icon={Phone} label="Mobile" value={user?.mobile || 'N/A'} />
                </div>

                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <p className="text-sm text-primary font-medium">Batch</p>
                    <p className="text-2xl font-bold text-foreground">{user?.batch || 'N/A'}</p>
                  </div>
                  <div className="bg-green-400/5 border border-green-400/20 p-4 rounded-lg">
                    <p className="text-sm text-green-400 font-medium">Semester</p>
                    <p className="text-2xl font-bold text-foreground">{user?.semester || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advisors Card */}
          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-400/10 p-2 rounded-full">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Advisors</h3>
            </div>

            <div className="space-y-4">
              {advisors?.map((advisor, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {/* Name + Role */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{advisor.name}</h4>
                      <p className="text-xs text-muted-foreground">{advisor.role}</p>
                    </div>
                    <AnimatedCopyButton 
                      textToCopy={advisor.name}
                      className="h-8 w-8"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <a
                      href={`mailto:${advisor.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {advisor.email}
                    </a>
                    <AnimatedCopyButton 
                      textToCopy={advisor.email}
                      className="h-8 w-8"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <a
                      href={`tel:${advisor.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {advisor.phone}
                    </a>
                    <AnimatedCopyButton 
                      textToCopy={advisor.phone}
                      className="h-8 w-8"
                    />
                  </div>


                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
  <div className="flex items-center space-x-3">
    <Icon className="w-5 h-5 text-muted-foreground" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  </div>
);