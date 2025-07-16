"use client";

import { motion } from "framer-motion";

export default function BackgroundBlobs() {
  return (
    <>
      <motion.div
        className="absolute w-72 h-72 top-[-100px] left-[-100px] rounded-full bg-pink-400 opacity-30 blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-72 h-72 bottom-[-100px] right-[-100px] rounded-full bg-sky-400 opacity-30 blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
      />
    </>
  );
}
