import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-36 pt-20 w-full bg-gray-950 text-gray-300">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
        <div className="md:max-w-96">
          <h2 className="text-xl font-bold text-white">NoctuaNovel</h2>
          <p className="mt-4 text-sm">
            Your gateway to the world of light novels. Discover, read, and enjoy thousands of translated novels from various genres.
          </p>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          <div>
            <h2 className="font-semibold mb-5">Navigation</h2>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/#latest" className="hover:text-white transition-colors">Latest</Link>
              </li>
              <li>
                <Link href="/#editors-choice" className="hover:text-white transition-colors">Editor&apos;s Choice</Link>
              </li>
              <li>
                <Link href="/#recommendation" className="hover:text-white transition-colors">Recommendation</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-5">About</h2>
            <ul className="text-sm space-y-2">
              <li>
                <span className="text-gray-400">Built with Next.js</span>
              </li>
              <li>
                <span className="text-gray-400">Powered by Prisma</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="pt-4 text-center text-sm pb-5">Copyright {new Date().getFullYear()} © NoctuaNovel. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
