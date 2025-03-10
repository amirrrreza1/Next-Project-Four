import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

interface LogEntry {
  productId: string;
  productTitle: string;
  productUrl: string;
  count: number;
  timestamp: number;
}

// دریافت اطلاعات محصول از API
const fetchProductInfo = async (
  productId: string
): Promise<{ title: string; url: string }> => {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${productId}`
  );
  if (!res.ok) return { title: "عنوان نامشخص", url: "#" };

  const product = await res.json();
  return {
    title: product.title,
    url: `http://localhost:3000/products/${productId}`,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const { title, url } = await fetchProductInfo(productId);
    const productRef = doc(db, "logs", productId); // مرجع داکیومنت برای این محصول
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      // اگر محصول وجود دارد، فقط count را افزایش بده
      await updateDoc(productRef, {
        count: docSnap.data().count + 1,
        timestamp: Date.now(),
      });
    } else {
      // اگر وجود ندارد، محصول را ثبت کن
      const logData: LogEntry = {
        productId,
        productTitle: title,
        productUrl: url,
        count: 1,
        timestamp: Date.now(),
      };

      await setDoc(productRef, logData);
    }

    return res.status(201).json({ message: "Log updated" });
  }

  if (req.method === "GET") {
    try {
      // مرتب‌سازی بر اساس تعداد بازدید (count)
      const logsQuery = query(collection(db, "logs"), orderBy("count", "desc"));
      const snapshot = await getDocs(logsQuery);
      const logs = snapshot.docs.map((doc) => doc.data());
      return res.status(200).json(logs);
    } catch (error) {
      console.error("Error fetching logs: ", error);
      return res.status(500).json({ error: "Failed to fetch logs" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
