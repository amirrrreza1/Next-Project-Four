import { useRouter } from "next/router";
import useSWR from "swr";
import { useEffect, useRef } from "react";
import Head from "next/head";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("محصول پیدا نشد!");
  return res.json();
};

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const hasLogged = useRef(false); // برای اطمینان از اینکه فقط یک بار لاگ ارسال شود

  const { data, error } = useSWR(
    id ? `https://jsonplaceholder.typicode.com/posts/${id}` : null,
    fetcher
  );

  useEffect(() => {
    if (id && !hasLogged.current) {
      hasLogged.current = true; // جلوگیری از اجرای مجدد
      fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      }).catch(console.error);
    }
  }, [id]);

  if (error) return <div className="text-red-500">محصول پیدا نشد!</div>;
  if (!data) return <div>در حال بارگذاری...</div>;

  return (
    <>
      <Head>
        <title>Product {data.id}</title>
      </Head>
      <div className="p-4">
        <h1 className="text-xl font-bold">{data.title}</h1>
        <p className="mt-2">{data.body}</p>
      </div>
    </>
  );
};

export default ProductDetail;
