import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface DailyMetrics {
  date: string;
  metrics: {
    leads: number;
    calls: number;
    contacts: number;
    scheduled: number;
    sits: number;
    sales: number;
  };
}

const DailyReport = () => {
  const [dailyReports, setDailyReports] = useState<DailyMetrics[]>([]);

  useEffect(() => {
    const storedReports = localStorage.getItem("dailyReports");
    if (storedReports) {
      setDailyReports(JSON.parse(storedReports));
    }
  }, []);

  useEffect(() => {
    const generateDailyReport = () => {
      const storedMetrics = localStorage.getItem("businessMetrics");
      if (storedMetrics) {
        const metrics = JSON.parse(storedMetrics);
        const today = format(new Date(), "yyyy-MM-dd");
        
        // Check if we already have a report for today
        const existingReportIndex = dailyReports.findIndex(
          (report) => report.date === today
        );

        if (existingReportIndex !== -1) {
          // Update existing report
          const updatedReports = [...dailyReports];
          updatedReports[existingReportIndex] = {
            date: today,
            metrics: { ...metrics },
          };
          setDailyReports(updatedReports);
          localStorage.setItem("dailyReports", JSON.stringify(updatedReports));
        } else {
          // Create new report
          const newReport = {
            date: today,
            metrics: { ...metrics },
          };
          const updatedReports = [newReport, ...dailyReports].slice(0, 30); // Keep last 30 days
          setDailyReports(updatedReports);
          localStorage.setItem("dailyReports", JSON.stringify(updatedReports));
        }
      }
    };

    // Generate report when metrics change
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "businessMetrics") {
        generateDailyReport();
      }
    };

    // Add event listener for storage changes
    window.addEventListener("storage", handleStorageChange);
    
    // Generate initial report
    generateDailyReport();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dailyReports]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Daily Reports</h2>
      <div className="space-y-4">
        {dailyReports.map((report) => (
          <Card key={report.date} className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                Report for {format(new Date(report.date), "MMMM d, yyyy")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(report.metrics).map(([metric, value]) => (
                  <div key={metric} className="text-sm">
                    <span className="font-medium capitalize">{metric}: </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DailyReport;