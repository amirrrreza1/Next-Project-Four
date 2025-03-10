import { useEffect, useState, useMemo } from "react";
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const logsQuery = query(
      collection(db, "logs"),
      orderBy("count", sortOrder)
    );

    return onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map((doc) => ({ ...(doc.data() as LogEntry) })));
    });
  }, [sortOrder]);

  const totalCount = useMemo(
    () => logs.reduce((sum, log) => sum + log.count, 0),
    [logs]
  );

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) =>
      sortOrder === "desc" ? b.count - a.count : a.count - b.count
    );
  }, [logs, sortOrder]);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString("en-US");

  const handleDownloadExcel = () => {
    if (logs.length === 0) return alert("No logs to export");

    const ws = XLSX.utils.json_to_sheet(
      logs.map(({ productId, productTitle, productUrl, count, timestamp }) => ({
        "Product ID": productId,
        "Product Title": productTitle,
        "Product URL": productUrl,
        "View Count": count,
        "Last View": formatDate(timestamp),
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs");
    XLSX.writeFile(wb, "logs.xlsx");
  };

  return (
    <>
      <Head>
        <title>Admin Panel</title>
      </Head>
      <div>
        <h1 className="text-xl font-bold mb-4 px-6">Admin Panel</h1>
        <p className="text-lg px-6">
          Total View Count: <strong>{totalCount}</strong>
        </p>

        <h2 className="text-lg font-semibold mt-5 mb-2 px-6">
          Product View Count
        </h2>

        <table className="w-[95%] m-auto border-collapse border border-gray-300 mt-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Product ID</th>
              <th className="border border-gray-300 p-2">Product Title</th>
              <th className="border border-gray-300 p-2">Product URL</th>
              <th
                className="border border-gray-300 p-2 cursor-pointer"
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
              >
                View Count {sortOrder === "desc" ? "↓" : "↑"}
              </th>
              <th className="border border-gray-300 p-2">Last View</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log, index) => (
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
          className="m-6 bg-green-500 text-white px-6 py-2 rounded"
        >
          Download Excel File
        </button>
      </div>
    </>
  );
}
