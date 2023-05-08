import cx from "classnames";

export default function Footer({className}: {
    className?: string;
}) {
  return (
    <footer className={cx("flex flex-col items-center justify-center w-full h-24 border-t", className)}>
      <a
        className="flex items-center justify-center text-blue-500"
        href="https://ericdudley.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="mr-2">Made by Eric Dudley</span>
        <img
          src="https://github.com/ericdudley.png"
          alt="Eric Dudley Logo"
          className="w-6 h-6 rounded-full"
        />
      </a>
    </footer>
  );
}
