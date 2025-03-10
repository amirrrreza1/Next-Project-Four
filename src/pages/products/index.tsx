import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";

// Define the Product type
interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

// Fetch function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error fetching data.");
  }
  return response.json();
};

const ProductsPage = () => {
  const { data, error } = useSWR("https://fakestoreapi.com/products", fetcher);

  if (error) {
    return (
      <p className="w-full h-screen absolute top-0 flex justify-center text-red-600 items-center text-3xl">
        Error fetching data.
      </p>
    );
  }

  if (!data) {
    return (
      <p className="w-full bg-black/80 h-screen absolute top-0 flex justify-center items-center text-3xl text-white">
        Loading products...
      </p>
    );
  }

  return (
    <>
      <Head>
        <title>Our Products</title>
      </Head>

      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">Our Products</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map((product: Product) => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden shadow-lg bg-white"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-56 object-fill p-2"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2">{product.category}</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  ${product.price}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-yellow-500">
                    {"★".repeat(Math.floor(product.rating.rate))}
                    {"☆".repeat(5 - Math.floor(product.rating.rate))}
                  </span>
                  <span className="text-gray-500 ml-2">
                    ({product.rating.count} reviews)
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-3 line-clamp-4">
                  {product.description}
                </p>
                <div className="mt-4">
                  <Link
                    href={`/products/${product.id}`}
                    rel="noopener noreferrer"
                    className="inline-block text-white bg-blue-500 px-4 py-2 rounded mt-2 hover:bg-blue-600 transition"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
