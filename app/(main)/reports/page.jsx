import {
  getMonthlyReports,
  generateMonthlyReport,
} from "@/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Sparkles, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

export default async function ReportsPage() {
  const reports = await getMonthlyReports();

  const defaultMonth = format(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    "yyyy-MM"
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Inventory intelligence
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight">
            Monthly Reports
          </h1>

          <p className="mt-2 text-slate-600">
            AI-generated analysis of your inventory activity.
          </p>
        </div>

        <form
          action={generateMonthlyReport}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="month"
            name="month"
            defaultValue={defaultMonth}
            className="rounded-md border px-3 py-2 text-sm"
          />

          <Button type="submit">
            <Sparkles size={16} />
            Generate AI Report
          </Button>
        </form>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="mx-auto mb-4" size={32} />
            <h2 className="text-lg font-semibold">
              No reports yet
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Select a month and generate your first inventory report.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <CardTitle>
                      {format(
                        new Date(report.reportMonth),
                        "MMMM yyyy"
                      )}
                    </CardTitle>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Generated{" "}
                      {format(
                        new Date(report.createdAt),
                        "PPP p"
                      )}
                    </p>
                  </div>

                  <Badge>
                    <Sparkles size={14} />
                    Gemini analysis
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="border-slate-200 shadow-none">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">
                        Received
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        {report.totalReceived}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-none">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">
                        Issued
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        {report.totalIssued}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-none">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">
                        Inventory Value
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        ₹{Number(report.endingInventoryValue).toFixed(0)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-none">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">
                        Low Stock
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        {report.lowStockCount}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={18} />
                    <h2 className="font-semibold">
                      AI Summary
                    </h2>
                  </div>

                  <p className="leading-7 text-slate-600">
                    {report.aiSummary}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold">
                      <TrendingUp size={17} />
                      Highlights
                    </h3>

                    <div className="space-y-2">
                      {report.aiHighlights.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-lg border p-3 text-sm text-slate-600"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold">
                      <AlertTriangle size={17} />
                      Risks
                    </h3>

                    <div className="space-y-2">
                      {report.aiRisks.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-lg border p-3 text-sm text-slate-600"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold">
                      <TrendingDown size={17} />
                      Recommendations
                    </h3>

                    <div className="space-y-2">
                      {report.aiRecommendations.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-lg border p-3 text-sm text-slate-600"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}