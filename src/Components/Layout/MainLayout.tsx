import Link from "next/link";
import { useRouter } from "next/router";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Admin", href: "/adminPage" },
];

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <>
      <header className="p-2 bg-white">
        <nav className="w-[95%] max-w-[1000px] m-auto rounded-md bg-blue-500 flex justify-center items-center gap-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={
                item.href === router.pathname
                  ? "text-white h-15 leading-15 border-b-2 opacity-100"
                  : "text-white h-15 leading-15 opacity-50"
              }
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </header>

      <main>{children}</main>
    </>
  );
};

export default MainLayout;
