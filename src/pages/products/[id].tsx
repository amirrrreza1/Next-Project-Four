import { useRouter } from "next/router";
import useSWR from "swr";
import { useEffect, useRef } from "react";
import Head from "next/head";

// Fetcher function to get data
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Product not found!");
  return res.json();
};

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const hasLogged = useRef(false);

  // Fetch product data
  const { data, error } = useSWR(
    id ? `https://fakestoreapi.com/products/${id}` : null,
    fetcher
  );

  useEffect(() => {
    if (id && !hasLogged.current) {
      hasLogged.current = true;
      fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      }).catch(console.error);
    }
  }, [id]);

  if (error)
    return (
      <div className="text-red-500 text-center mt-8">Product not found!</div>
    );
  if (!data) return <div className="text-center mt-8">Loading...</div>;

  return (
    <>
      <Head>
        <title>Product {data.id}</title>
      </Head>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-4">{data.title}</h1>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-center mb-6">
            <img
              src={data.image}
              alt={data.title}
              className="w-48 h-48 object-contain"
            />
          </div>

          <p className="text-xl text-gray-700 mb-4">{data.description}</p>

          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold text-gray-800">${data.price}</p>
            <p className="text-sm text-gray-600">
              Rating: {data.rating.rate} ({data.rating.count} reviews)
            </p>
          </div>

          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition"
          >
            View on Store
          </a>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
