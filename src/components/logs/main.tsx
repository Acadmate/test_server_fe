"use client";
import { useState, useEffect } from "react";
import Title from "@/components/shared/title";
import { fetchLogs } from "@/actions/logsFetch";
import { Skeleton } from "@/components/ui/skeleton";

interface LogCard {
  type: string;
  activity: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

const LogCardComponent = ({ log, index }: { log: LogCard; index: number }) => (
  <div key={index} className="bg-card border rounded-lg p-4 mb-3 shadow-sm">
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
          {log.type}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(log.timestamp).toLocaleString()}
        </span>
      </div>
      <p className="font-medium text-foreground">{log.activity}</p>
      {log.oldValue && log.newValue && (
        <div className="text-sm text-muted-foreground">
          <span className="line-through">{log.oldValue}</span>
          <span className="mx-2">→</span>
          <span className="text-green-600 dark:text-green-400">{log.newValue}</span>
        </div>
      )}
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="flex flex-col w-full space-y-3">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-24 w-full rounded-lg" />
    ))}
  </div>
);

export default function LogsMain() {
  const [logs, setLogs] = useState<LogCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLogs();
        
        if (data && Array.isArray(data)) {
          setLogs(data);
        } else {
          setError("Invalid data format received");
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Failed to load logs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLogs();
      
      if (data && Array.isArray(data)) {
        setLogs(data);
      } else {
        setError("Invalid data format received");
      }
    } catch (err) {
      console.error("Error refreshing logs:", err);
      setError("Failed to refresh logs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <Title />
        <div className="p-4">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full">
        <Title />
        <div className="p-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <Title />
      <div className="p-4">
        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <LogCardComponent key={index} log={log} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg">No logs available</p>
            <p className="text-sm">There are no activity logs to display at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
