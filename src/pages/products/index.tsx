import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import Head from "next/head";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching products");
  return res.json();
};

const ProductPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = 10;

  const { data, error } = useSWR(
    page <= totalPages
      ? `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`
      : null,
    fetcher
  );

  if (error) return <div>{error.message}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>Products</title>
      </Head>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Products</h1>

        <div className="space-y-2">
          {data.map((product: any) => (
            <Link
              href={`/products/${product.id}`}
              key={product.id}
              className="block p-2 border rounded-md hover:bg-gray-100"
            >
              {product.title}
            </Link>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-md bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
