"use client";
import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import * as animationData from "../../../public/underDev.json";

const Animation = () => {
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
    <div>
      <Lottie options={defaultOptions} />
    </div>
  );
};

export default Animation;
