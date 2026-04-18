import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Telemetry Analysis Tool
 * Analyzes and compares telemetry reports
 */

class TelemetryAnalyzer {
  constructor() {
    this.reports = [];
    this.telemetryDir = path.join(__dirname, "../telemetry");
  }

  /**
   * Calculate a percentile using nearest-rank over sorted values.
   */
  calculatePercentile(values, percentile) {
    if (!Array.isArray(values) || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const rank = Math.ceil((percentile / 100) * sorted.length);
    const index = Math.min(Math.max(rank - 1, 0), sorted.length - 1);
    return sorted[index];
  }

  /**
   * Build percentile stats from detailed route results.
   */
  getPercentileStats(report) {
    const allTimes = (report.detailedResults || [])
      .filter((route) => !route.skipped && typeof route.responseTime === "number")
      .map((route) => route.responseTime);

    const successTimes = (report.detailedResults || [])
      .filter(
        (route) =>
          route.success === true &&
          !route.skipped &&
          typeof route.responseTime === "number",
      )
      .map((route) => route.responseTime);

    const toStats = (values) => ({
      p50: this.calculatePercentile(values, 50),
      p95: this.calculatePercentile(values, 95),
      p99: this.calculatePercentile(values, 99),
      count: values.length,
    });

    return {
      all: toStats(allTimes),
      successOnly: toStats(successTimes),
    };
  }

  /**
   * Load all telemetry reports from the telemetry directory
   */
  loadReports() {
    if (!fs.existsSync(this.telemetryDir)) {
      console.error(
        "❌ Telemetry directory not found. Run 'npm run telemetry' first.",
      );
      process.exit(1);
    }

    const files = fs
      .readdirSync(this.telemetryDir)
      .filter((f) => f.startsWith("telemetry-") && f.endsWith(".json"))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error(
        "❌ No telemetry reports found. Run 'npm run telemetry' first.",
      );
      process.exit(1);
    }

    files.forEach((file) => {
      const filePath = path.join(this.telemetryDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      this.reports.push({
        filename: file,
        timestamp: data.metadata.collectionTime,
        data,
      });
    });

    console.log(`📂 Loaded ${this.reports.length} telemetry report(s)\n`);
  }

  /**
   * Compare latest reports to find performance changes
   */
  compareReports(numReports = 2) {
    if (this.reports.length < numReports) {
      console.warn(
        `⚠️  Only ${this.reports.length} report(s) available. Need at least ${numReports} to compare.`,
      );
      return;
    }

    const latestReports = this.reports.slice(0, numReports);
    console.log("📊 COMPARING LATEST TELEMETRY REPORTS\n");
    console.log(
      "Reports: " +
        latestReports.map((r) => r.filename).join(" vs ") +
        "\n",
    );

    const older = latestReports[latestReports.length - 1];
    const newer = latestReports[0];

    // Response time comparison
    const olderAvg = parseFloat(
      older.data.responseTimeStats.average.replace("ms", ""),
    );
    const newerAvg = parseFloat(
      newer.data.responseTimeStats.average.replace("ms", ""),
    );
    const avgDiff = ((newerAvg - olderAvg) / olderAvg) * 100;

    console.log("⏱️  RESPONSE TIME");
    console.log(
      `  Previous Avg: ${older.data.responseTimeStats.average} → New Avg: ${newer.data.responseTimeStats.average}`,
    );
    console.log(
      `  Change: ${avgDiff > 0 ? "🔴" : "🟢"} ${avgDiff.toFixed(2)}%\n`,
    );

    // Success rate comparison
    const olderSuccess = parseFloat(older.data.summary.successRate);
    const newerSuccess = parseFloat(newer.data.summary.successRate);
    const successDiff = newerSuccess - olderSuccess;

    console.log("✅ SUCCESS RATE");
    console.log(
      `  Previous: ${older.data.summary.successRate} → New: ${newer.data.summary.successRate}`,
    );
    console.log(
      `  Change: ${successDiff >= 0 ? "🟢" : "🔴"} ${successDiff.toFixed(2)}%\n`,
    );

    // Failed routes comparison
    if (newer.data.failedRoutes.length > 0) {
      console.log("⚠️  FAILED ROUTES (Latest Report):");
      newer.data.failedRoutes.forEach((route) => {
        console.log(
          `  ❌ ${route.method.padEnd(6)} ${route.path} - ${route.error}`,
        );
      });
      console.log("");
    }
  }

  /**
   * Find performance regressions (routes that got slower)
   */
  findRegressions(threshold = 20) {
    if (this.reports.length < 2) {
      console.warn("⚠️  Need at least 2 reports to detect regressions.");
      return;
    }

    const older = this.reports[this.reports.length - 1];
    const newer = this.reports[0];

    const regressions = [];

    newer.data.detailedResults.forEach((newRoute) => {
      const oldRoute = older.data.detailedResults.find(
        (r) => r.path === newRoute.path && r.method === newRoute.method,
      );

      if (oldRoute) {
        const diff = ((newRoute.responseTime - oldRoute.responseTime) / oldRoute.responseTime) * 100;
        if (diff > threshold) {
          regressions.push({
            path: newRoute.path,
            method: newRoute.method,
            oldTime: oldRoute.responseTime,
            newTime: newRoute.responseTime,
            percentChange: diff.toFixed(2),
          });
        }
      }
    });

    if (regressions.length > 0) {
      console.log(
        `🔴 PERFORMANCE REGRESSIONS (>${threshold}% slower)\n`,
      );
      regressions
        .sort((a, b) => parseFloat(b.percentChange) - parseFloat(a.percentChange))
        .forEach((r) => {
          console.log(
            `  ${r.method.padEnd(6)} ${r.path}`,
          );
          console.log(
            `    ${r.oldTime.toFixed(2)}ms → ${r.newTime.toFixed(2)}ms (+${r.percentChange}%)`,
          );
        });
      console.log("");
    } else {
      console.log(
        `✅ No significant regressions detected (threshold: ${threshold}%)\n`,
      );
    }
  }

  /**
   * Find improvements (routes that got faster)
   */
  findImprovements(threshold = 20) {
    if (this.reports.length < 2) {
      console.warn("⚠️  Need at least 2 reports to detect improvements.");
      return;
    }

    const older = this.reports[this.reports.length - 1];
    const newer = this.reports[0];

    const improvements = [];

    newer.data.detailedResults.forEach((newRoute) => {
      const oldRoute = older.data.detailedResults.find(
        (r) => r.path === newRoute.path && r.method === newRoute.method,
      );

      if (oldRoute) {
        const diff = ((oldRoute.responseTime - newRoute.responseTime) / oldRoute.responseTime) * 100;
        if (diff > threshold) {
          improvements.push({
            path: newRoute.path,
            method: newRoute.method,
            oldTime: oldRoute.responseTime,
            newTime: newRoute.responseTime,
            percentChange: diff.toFixed(2),
          });
        }
      }
    });

    if (improvements.length > 0) {
      console.log(
        `🟢 PERFORMANCE IMPROVEMENTS (>${threshold}% faster)\n`,
      );
      improvements
        .sort((a, b) => parseFloat(b.percentChange) - parseFloat(a.percentChange))
        .forEach((r) => {
          console.log(
            `  ${r.method.padEnd(6)} ${r.path}`,
          );
          console.log(
            `    ${r.oldTime.toFixed(2)}ms → ${r.newTime.toFixed(2)}ms (-${r.percentChange}%)`,
          );
        });
      console.log("");
    }
  }

  /**
   * Show the latest report summary
   */
  showLatestSummary() {
    if (this.reports.length === 0) return;

    const latest = this.reports[0];
    const report = latest.data;
    const percentiles = this.getPercentileStats(report);

    console.log("📋 LATEST REPORT: " + latest.filename + "\n");
    console.log("=" + "=".repeat(59));
    console.log("📊 SUMMARY");
    console.log("=" + "=".repeat(59));
    console.log(
      `Timestamp:     ${new Date(report.metadata.collectionTime).toLocaleString()}`,
    );
    console.log(`Total Routes:  ${report.summary.totalRoutes}`);
    console.log(`Successful:    ${report.summary.successfulRequests}`);
    console.log(`Failed:        ${report.summary.failedRequests}`);
    console.log(`Success Rate:  ${report.summary.successRate}`);

    console.log("\n" + "=" + "=".repeat(59));
    console.log("⏱️  RESPONSE TIME STATS");
    console.log("=" + "=".repeat(59));
    console.log(`Average:  ${report.responseTimeStats.average}`);
    console.log(`Fastest:  ${report.responseTimeStats.min}`);
    console.log(`Slowest:  ${report.responseTimeStats.max}`);

    const safeFormat = (value) =>
      typeof value === "number" ? `${value.toFixed(2)}ms` : "N/A";

    console.log("\n📈 Percentiles (all executed routes)");
    console.log(`P50:      ${safeFormat(percentiles.all.p50)}`);
    console.log(`P95:      ${safeFormat(percentiles.all.p95)}`);
    console.log(`P99:      ${safeFormat(percentiles.all.p99)}`);

    console.log("\n📈 Percentiles (successful routes only)");
    console.log(`P50:      ${safeFormat(percentiles.successOnly.p50)}`);
    console.log(`P95:      ${safeFormat(percentiles.successOnly.p95)}`);
    console.log(`P99:      ${safeFormat(percentiles.successOnly.p99)}`);

    console.log("\n" + "=" + "=".repeat(59));
    console.log("🚀 TOP 5 FASTEST ROUTES");
    console.log("=" + "=".repeat(59));
    report.fastestRoutes.forEach((route, i) => {
      console.log(
        `${(i + 1).toString().padEnd(2)}. ${route.method.padEnd(6)} ${route.path}`,
      );
      console.log(`    ${route.responseTime.padEnd(12)} (${route.statusCode})`);
    });

    console.log("\n" + "=" + "=".repeat(59));
    console.log("🐢 TOP 5 SLOWEST ROUTES");
    console.log("=" + "=".repeat(59));
    report.slowestRoutes.forEach((route, i) => {
      console.log(
        `${(i + 1).toString().padEnd(2)}. ${route.method.padEnd(6)} ${route.path}`,
      );
      console.log(`    ${route.responseTime.padEnd(12)} (${route.statusCode})`);
    });

    if (report.failedRoutes.length > 0) {
      console.log("\n" + "=" + "=".repeat(59));
      console.log("⚠️  FAILED ROUTES");
      console.log("=" + "=".repeat(59));
      report.failedRoutes.forEach((route) => {
        console.log(
          `${route.method.padEnd(6)} ${route.path.padEnd(40)} ${route.error}`,
        );
      });
    }

    console.log("\n" + "=" + "=".repeat(59) + "\n");
  }

  /**
   * Export comparison as CSV
   */
  exportComparison(filename = "telemetry-comparison.csv") {
    if (this.reports.length < 2) {
      console.warn("⚠️  Need at least 2 reports to export comparison.");
      return;
    }

    const older = this.reports[this.reports.length - 1];
    const newer = this.reports[0];

    let csv =
      "Method,Path,Old Response Time (ms),New Response Time (ms),Change (%),Old Status,New Status\n";

    newer.data.detailedResults.forEach((newRoute) => {
      const oldRoute = older.data.detailedResults.find(
        (r) => r.path === newRoute.path && r.method === newRoute.method,
      );

      if (oldRoute) {
        const change = (
          ((newRoute.responseTime - oldRoute.responseTime) /
            oldRoute.responseTime) *
          100
        ).toFixed(2);
        csv += `${newRoute.method},"${newRoute.path}",${oldRoute.responseTime.toFixed(2)},${newRoute.responseTime.toFixed(2)},${change},${oldRoute.statusCode},${newRoute.statusCode}\n`;
      }
    });

    const filePath = path.join(__dirname, "../telemetry", filename);
    fs.writeFileSync(filePath, csv);
    console.log(`✅ Comparison exported to: ${filePath}\n`);
  }
}

// Main execution
async function main() {
  const analyzer = new TelemetryAnalyzer();
  const command = process.argv[2] || "summary";

  analyzer.loadReports();

  switch (command) {
    case "summary":
    case "p95":
      analyzer.showLatestSummary();
      break;
    case "compare":
      analyzer.compareReports(2);
      break;
    case "regressions":
      analyzer.findRegressions(20);
      break;
    case "improvements":
      analyzer.findImprovements(20);
      break;
    case "all":
      analyzer.showLatestSummary();
      analyzer.compareReports(2);
      analyzer.findRegressions(20);
      analyzer.findImprovements(20);
      analyzer.exportComparison();
      break;
    case "export":
      analyzer.exportComparison();
      break;
    default:
      console.log("Usage: node scripts/analyzeTelemetry.js [command]");
      console.log("\nAvailable commands:");
      console.log("  summary        - Show latest report summary (default)");
      console.log("  p95            - Show summary including percentile stats");
      console.log("  compare        - Compare latest two reports");
      console.log("  regressions    - Find performance regressions");
      console.log("  improvements   - Find performance improvements");
      console.log("  export         - Export comparison as CSV");
      console.log("  all            - Run all analyses\n");
  }
}

main().catch(console.error);
