import React from "react";

const Header = ({ title }: { title: string }) => {
  return <h1 className="text-3xl md:text-4xl font-bold text-gray-100">{title}</h1>;
};

export default Header;
