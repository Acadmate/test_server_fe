"use client";
import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import * as animationData from "../../../public/loader.json";

const Loader = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="w-fit h-fit">
      <Lottie options={defaultOptions} />
    </div>
  );
};

export default Loader;
