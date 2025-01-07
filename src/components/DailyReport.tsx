import { useState, useEffect } from "react";
import DailyReportCard from "./reports/DailyReportCard";
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
    ap: number;
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
        
        const existingReportIndex = dailyReports.findIndex(
          (report) => report.date === today
        );

        if (existingReportIndex !== -1) {
          const updatedReports = [...dailyReports];
          updatedReports[existingReportIndex] = {
            date: today,
            metrics: { ...metrics },
          };
          setDailyReports(updatedReports);
          localStorage.setItem("dailyReports", JSON.stringify(updatedReports));
        } else {
          const newReport = {
            date: today,
            metrics: { ...metrics },
          };
          const updatedReports = [newReport, ...dailyReports].slice(0, 30);
          setDailyReports(updatedReports);
          localStorage.setItem("dailyReports", JSON.stringify(updatedReports));
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "businessMetrics") {
        generateDailyReport();
      }
    };

    window.addEventListener("storage", handleStorageChange);
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
          <DailyReportCard
            key={report.date}
            date={report.date}
            metrics={report.metrics}
          />
        ))}
      </div>
    </div>
  );
};

export default DailyReport;