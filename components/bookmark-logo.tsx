export default function BookmarkLogo(
  props: React.SVGProps<SVGSVGElement>
) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 2C4.44772 2 4 2.44772 4 3V21C4 21.8068 4.58579 22.4793 5.35317 22.4954C5.56435 22.5 5.77151 22.4554 5.96064 22.3638L12 18.9896L18.0394 22.3638C18.2285 22.4554 18.4356 22.5 18.6468 22.4954C19.4142 22.4793 20 21.8068 20 21V3C20 2.44772 19.5523 2 19 2H5ZM6 4H18V20.0918L12.5393 16.9234C12.2143 16.7493 11.7857 16.7493 11.4607 16.9234L6 20.0918V4Z"
        fill="currentColor"
      />
    </svg>
  );
}
