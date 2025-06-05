import { Phone, Calendar, MessageSquare, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MemberCard = ({ data }: { data: any }) => {
  console.log("data", data);
  return (
    <div className="bg-red-200 p-4 rounded-lg relative cursor-pointer transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {data.profile_image_url ? (
            <img src={data.profile_image_url} className="size-10 rounded-full" />
          ) : (
            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
              {data.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold">{data.name}</h3>
            <p className="text-sm text-muted-foreground">{data.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-green-600">
            {data.metrics.conversion}% Conversion
          </div>
          <Progress value={data.metrics.conversion} className="w-24 h-2" />
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{data.metrics.leads}</div>
          <div className="text-xs text-muted-foreground">Leads</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{data.metrics.calls}</div>
          <div className="text-xs text-muted-foreground">Calls</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{data.metrics.contacts}</div>
          <div className="text-xs text-muted-foreground">Contacts</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{data.metrics.scheduled}</div>
          <div className="text-xs text-muted-foreground">Scheduled</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{data.metrics.sits}</div>
          <div className="text-xs text-muted-foreground">Sits</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{data.metrics.sales}</div>
          <div className="text-xs text-muted-foreground">Sales</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center col-span-2">
          <div className="text-lg font-bold text-green-600">${data.metrics.ap}</div>
          <div className="text-xs text-muted-foreground">AP</div>
        </div>
      </div>

      {/* Ratio Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Lead Based Ratios */}
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.leadsToContact}%</div>
          <div className="text-xs text-muted-foreground">Lead to Contact</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.leadsToScheduled}%</div>
          <div className="text-xs text-muted-foreground">Lead to Scheduled</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.leadsToSits}%</div>
          <div className="text-xs text-muted-foreground">Lead to Sits</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.leadsToSales}%</div>
          <div className="text-xs text-muted-foreground">Lead to Sales</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">${data.metrics.ratios.aPPerLead}</div>
          <div className="text-xs text-muted-foreground">AP per Lead</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.contactToScheduled}%</div>
          <div className="text-xs text-muted-foreground">Contact to Scheduled</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.contactToSits}%</div>
          <div className="text-xs text-muted-foreground">Contact to Sits</div>
        </div>

        {/* Call Based Ratios */}
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.callsToContact}%</div>
          <div className="text-xs text-muted-foreground">Calls to Contact</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.callsToScheduled}%</div>
          <div className="text-xs text-muted-foreground">Calls to Scheduled</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.callsToSits}%</div>
          <div className="text-xs text-muted-foreground">Calls to Sits</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.callsToSales}%</div>
          <div className="text-xs text-muted-foreground">Calls to Sales</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">${data.metrics.ratios.aPPerCall}</div>
          <div className="text-xs text-muted-foreground">AP per Call</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.contactToSales}%</div>
          <div className="text-xs text-muted-foreground">Contact to Sales</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">${data.metrics.ratios.aPPerContact}</div>
          <div className="text-xs text-muted-foreground">AP per Contact</div>
        </div>

        {/* Scheduled and Sits Based Ratios */}
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.scheduledToSits}%</div>
          <div className="text-xs text-muted-foreground">Scheduled to Sits</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">{data.metrics.ratios.sitsToSalesCloseRatio}%</div>
          <div className="text-xs text-muted-foreground">Sits to Sales</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">${data.metrics.ratios.aPPerSit}</div>
          <div className="text-xs text-muted-foreground">AP per Sit</div>
        </div>
        <div className="bg-gray-100 p-2 rounded text-center">
          <div className="text-sm font-semibold">${data.metrics.ratios.aPPerSale}</div>
          <div className="text-xs text-muted-foreground">AP per Sale</div>
        </div>
      </div>

      {/* Success Calculator and 1:1 Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Success Calculator Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">SUCCESS CALCULATOR</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium">Conversion Rate</span>
              </div>
              <div className="text-lg font-bold text-green-600">{data.metrics.conversion}%</div>
              {/* <p className="text-xs text-muted-foreground">
                {timeRange === "weekly"
                  ? "Weekly"
                  : timeRange === "monthly"
                  ? "Monthly"
                  : "Year to Date"}{" "}
                Rate
              </p> */}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium">Success Score</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {Math.round((data.metrics.conversion / 100) * 100)}
              </div>
              {/* <p className="text-xs text-muted-foreground">
                {timeRange === "weekly"
                  ? "Weekly"
                  : timeRange === "monthly"
                  ? "Monthly"
                  : "Year to Date"}{" "}
                Rating
              </p> */}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Individual Progress</span>
              <span>{data.metrics.conversion}%</span>
            </div>
            <Progress value={data.metrics.conversion} className="h-1.5" />
          </div>
        </div>

        {/* 1:1 Notes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">1:1 NOTES</h3>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {data?.notes.map((note, index) => (
              <div key={note.id} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{note.content}</p>
              </div>
            ))}
            {data?.notes.length === 0 && (
              <p className="text-xs text-muted-foreground">No 1:1 notes available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
