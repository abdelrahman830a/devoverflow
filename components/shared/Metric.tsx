import React from "react";
import Image from "next/image";
import Link from "next/link";

interface MetricProps {
  imgUrl: string;
  alt: string;
  value: number | string;
  title?: string;
  textStyles?: string;
  href?: string;
  isAuthor?: boolean;
}

const Metric = ({
  imgUrl,
  alt,
  value,
  title,
  textStyles,
  href,
  isAuthor,
}: MetricProps) => {
  const metricContent = (
    <div className="flex gap-1">
      <Image
        src={imgUrl}
        width={16}
        height={16}
        alt={alt}
        className={`object-contain ${href ? "rounded-full" : ""}`}
      />

      <p className={`${textStyles} flex items-center gap-1 `}>
        {value}

        <span
          className={`small-regular line-clamp-1 ${isAuthor ? "max-sm:hidden" : ""}`}>
          {title}
        </span>
      </p>
    </div>
  );
  if (href) {
    return <Link href={href}>{metricContent}</Link>;
  }
  return (
    <div className="flex-center flex flex-wrap gap-1">{metricContent}</div>
  );
};

export default Metric;
