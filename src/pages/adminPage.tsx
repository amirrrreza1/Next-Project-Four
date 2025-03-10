import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import * as XLSX from "xlsx";
import Head from "next/head";

interface LogEntry {
  productId: string;
  productTitle: string;
  productUrl: string;
  count: number;
  timestamp: number;
}

export default function AdminPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const logsQuery = query(
      collection(db, "logs"),
      orderBy("count", sortOrder)
    );
    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const fetchedLogs: LogEntry[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as LogEntry),
      }));
      setLogs(fetchedLogs);

      const total = fetchedLogs.reduce((sum, log) => sum + log.count, 0);
      setTotalCount(total);
    });

    return () => unsubscribe();
  }, [sortOrder]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US");
  };

  const handleDownloadExcel = () => {
    const dataToExport = logs.map(
      ({ productId, productTitle, productUrl, count, timestamp }) => ({
        "Product ID": productId,
        "Product Title": productTitle,
        "Product URL": productUrl,
        "View Count": count,
        "Last View": formatDate(timestamp),
      })
    );

    if (dataToExport.length === 0) {
      alert("No logs to export");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4CAF50" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    const dataStyle = {
      alignment: { horizontal: "center" },
      font: { color: { rgb: "000000" } },
    };

    for (let col = 0; col < 5; col++) {
      const headerCell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (headerCell) headerCell.s = headerStyle;
    }

    for (let row = 1; row <= dataToExport.length; row++) {
      for (let col = 0; col < 5; col++) {
        const dataCell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
        if (dataCell) dataCell.s = dataStyle;
      }
    }

    const wscols = [
      { wch: 12 },
      { wch: 40 },
      { wch: 50 },
      { wch: 15 },
      { wch: 25 },
    ];

    ws["!cols"] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs");

    XLSX.writeFile(wb, "logs.xlsx");
  };

  const handleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  return (
    <>
      <Head>
        <title>Admin Panel</title>
      </Head>
      <div className="p-5">
        <h1 className="text-xl font-bold mb-4">Admin Panel</h1>
        <p className="text-lg">
          Total View Count: <strong>{totalCount}</strong>
        </p>

        <h2 className="text-lg font-semibold mt-5 mb-2">Product View Count</h2>

        <table className="w-full border-collapse border border-gray-300 mt-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Product ID</th>
              <th className="border border-gray-300 p-2">Product Title</th>
              <th className="border border-gray-300 p-2">Product URL</th>
              <th
                className="border border-gray-300 p-2 cursor-pointer"
                onClick={handleSort}
              >
                View Count
                {sortOrder === "desc" ? " ↓" : " ↑"}
              </th>
              <th className="border border-gray-300 p-2">Last View</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="text-center">
                <td className="border border-gray-300 p-2">{log.productId}</td>
                <td className="border border-gray-300 p-2">
                  {log.productTitle}
                </td>
                <td className="border border-gray-300 p-2">
                  <a
                    href={log.productUrl}
                    className="text-blue-600"
                    target="_blank"
                  >
                    View Product
                  </a>
                </td>
                <td className="border border-gray-300 p-2">{log.count}</td>
                <td className="border border-gray-300 p-2">
                  {formatDate(log.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={handleDownloadExcel}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Download Excel File
        </button>
      </div>
    </>
  );
}
