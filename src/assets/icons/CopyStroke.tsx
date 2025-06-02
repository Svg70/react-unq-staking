import { Ref, SVGProps, forwardRef, memo } from 'react'

const SvgCopyStroke = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    width="1.5em"
    height="1.5em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <mask
      id="mask0_6_1491"
      style={{ maskType: 'luminance' }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="24"
      height="24"
    >
      <path d="M24 0H0V24H24V0Z" fill="white" />
    </mask>
    <g mask="url(#mask0_6_1491)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.5 4.75C4.5 4.61193 4.61193 4.5 4.75 4.5H13.25C13.3881 4.5 13.5 4.61193 13.5 4.75V8.75H15V4.75C15 3.7835 14.2165 3 13.25 3H4.75C3.7835 3 3 3.7835 3 4.75V14.25C3 15.2165 3.7835 16 4.75 16H9.75V14.5H4.75C4.61193 14.5 4.5 14.3881 4.5 14.25V4.75Z"
        fill="currentColor"
      />
      <path
        d="M19.25 8.75H10.75C10.1977 8.75 9.75 9.19772 9.75 9.75V19.25C9.75 19.8023 10.1977 20.25 10.75 20.25H19.25C19.8023 20.25 20.25 19.8023 20.25 19.25V9.75C20.25 9.19772 19.8023 8.75 19.25 8.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgCopyStroke)
const Memo = memo(ForwardRef)

export default Memo
