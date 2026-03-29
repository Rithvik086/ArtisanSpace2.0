import type { HTMLAttributes } from "react";

type RupeeIconProps = HTMLAttributes<HTMLSpanElement>;

const RupeeIcon = ({ className, ...props }: RupeeIconProps) => {
  return (
    <span aria-hidden="true" className={className} {...props}>
      ₹
    </span>
  );
};

export default RupeeIcon;
