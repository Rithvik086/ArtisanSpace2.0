import React from "react";

const RupeeIcon = ({ className, ...props }: any) => {
  return (
    <span aria-hidden="true" className={className} {...props}>
      ₹
    </span>
  );
};

export default RupeeIcon;
