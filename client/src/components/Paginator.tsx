import Pagination from "rc-pagination";
import React from "react";

interface Props {
  total: number;
  current: number;
  pageSize: number;
  onChange: (current: number, pageSize: number) => void;
}

export default function Paginator({
  total,
  current,
  pageSize,
  onChange,
}: Props) {
  const itemRender = (
    page: number,
    type: "prev" | "next" | "page" | "jump-prev" | "jump-next",
    originalElement: React.ReactNode
  ): React.ReactNode => {
    if (type === "prev") {
      return (
        <button>
          <i>{"<"}</i>
        </button>
      );
    }
    if (type === "next") {
      return (
        <button>
          <i>{">"}</i>
        </button>
      );
    }
    return originalElement;
  };
  return (
    <Pagination
      total={total}
      current={current}
      pageSize={pageSize}
      onChange={onChange}
      itemRender={itemRender}
      className="pagination"
    />
  );
}
