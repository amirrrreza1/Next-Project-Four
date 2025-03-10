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
  const [totalCount, setTotalCount] = useState<number>(0); // مجموع تعداد بازدیدها
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // تایپ صحیح برای ترتیب مرتب‌سازی

  useEffect(() => {
    // اطمینان از دریافت داده‌ها به صورت مرتب‌شده بر اساس count
    const logsQuery = query(
      collection(db, "logs"),
      orderBy("count", sortOrder)
    );
    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const fetchedLogs: LogEntry[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as LogEntry),
      }));
      setLogs(fetchedLogs);

      // محاسبه مجموع تعداد count ها
      const total = fetchedLogs.reduce((sum, log) => sum + log.count, 0);
      setTotalCount(total);
    });

    return () => unsubscribe();
  }, [sortOrder]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("fa-IR");
  };

  const handleDownloadExcel = () => {
    const dataToExport = logs.map(
      ({ productId, productTitle, productUrl, count, timestamp }) => ({
        "شناسه محصول": productId,
        "عنوان محصول": productTitle,
        "لینک محصول": productUrl,
        "تعداد بازدید": count,
        "تاریخ آخرین بازدید": formatDate(timestamp),
      })
    );

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs");
    XLSX.writeFile(wb, "logs.xlsx");
  };

  // تغییر ترتیب مرتب‌سازی
  const handleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  return (
    <>
      <Head>
        <title>Admin Panel</title>
      </Head>
      <div className="p-5">
        <h1 className="text-xl font-bold mb-4">پنل ادمین</h1>
        {/* نمایش مجموع تعداد بازدیدها */}
        <p className="text-lg">
          مجموع تعداد بازدیدها: <strong>{totalCount}</strong>
        </p>

        <h2 className="text-lg font-semibold mt-5 mb-2">
          تعداد کال شدن هر محصول
        </h2>

        <table className="w-full border-collapse border border-gray-300 mt-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">شناسه محصول</th>
              <th className="border border-gray-300 p-2">عنوان محصول</th>
              <th className="border border-gray-300 p-2">لینک محصول</th>
              <th
                className="border border-gray-300 p-2 cursor-pointer"
                onClick={handleSort}
              >
                تعداد بازدید
                {/* نشان دادن جهت مرتب‌سازی */}
                {sortOrder === "desc" ? " ↓" : " ↑"}
              </th>
              <th className="border border-gray-300 p-2">آخرین بازدید</th>
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
                    className="text-blue-600 underline"
                    target="_blank"
                  >
                    مشاهده محصول
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
          دانلود فایل Excel
        </button>
      </div>
    </>
  );
}
